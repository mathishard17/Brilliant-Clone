import { getOpenAiApiKey, readJsonBody, requestOpenAiJson, requirePost } from './_openai.js'

const IS_DEV = process.env.NODE_ENV !== 'production'
const RELATIONSHIP_TYPES = new Set(['prerequisite', 'related', 'deepening', 'transfer'])
const MIN_CONCEPTS = 4
const MAX_CONCEPTS = 10

function fallbackResponse(debugError) {
  return {
    conceptMap: null,
    source: 'fallback',
    ...(IS_DEV && debugError ? { debugError } : {}),
  }
}

function safeString(value, maxLength) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) return trimmed
  const clipped = trimmed.slice(0, maxLength).replace(/\s+\S*$/, '').trim()
  return clipped || trimmed.slice(0, maxLength).trim()
}

function slugify(value, fallback) {
  const slug = safeString(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return slug || fallback
}

function normalizeConcept(rawConcept, index) {
  if (!rawConcept || typeof rawConcept !== 'object' || Array.isArray(rawConcept)) return null

  const id = slugify(rawConcept.id || rawConcept.label || rawConcept.topic, `concept_${index + 1}`)
  const label = safeString(rawConcept.label, 64)
  const topic = safeString(rawConcept.topic || label, 90)
  const learningGoal = safeString(rawConcept.learningGoal || rawConcept.skill, 180)
  const kidDescription = safeString(rawConcept.kidDescription || rawConcept.description, 180)
  const shortLabel = safeString(rawConcept.shortLabel || label, 24)
  const difficulty = Number(rawConcept.difficulty)

  if (!label || !topic || !learningGoal || !kidDescription || !Number.isFinite(difficulty)) return null

  return {
    id,
    label,
    shortLabel: shortLabel || label.slice(0, 24),
    topic,
    learningGoal,
    kidDescription,
    difficulty: Math.min(Math.max(Math.round(difficulty), 1), 5),
  }
}

function normalizeRelationship(rawRelationship) {
  if (!rawRelationship || typeof rawRelationship !== 'object' || Array.isArray(rawRelationship)) return null

  const from = slugify(rawRelationship.from, '')
  const to = slugify(rawRelationship.to, '')
  const type = safeString(rawRelationship.type, 20)
  const reason = safeString(rawRelationship.reason || rawRelationship.why, 180)

  if (!from || !to || from === to || !RELATIONSHIP_TYPES.has(type) || !reason) return null
  return { from, to, type, reason }
}

function normalizeConceptMap(value, fallbackAudience) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { conceptMap: null, issue: 'OpenAI response was not an object.' }
  }

  const topic = safeString(value.topic, 80)
  const bigIdea = safeString(value.bigIdea, 220)
  const audience = safeString(value.audience, 60) || fallbackAudience
  const rawConcepts = Array.isArray(value.concepts) ? value.concepts : []
  const concepts = rawConcepts
    .map(normalizeConcept)
    .filter(Boolean)
    .slice(0, MAX_CONCEPTS)

  if (!topic || !bigIdea) return { conceptMap: null, issue: 'OpenAI response missed topic or bigIdea.' }
  if (concepts.length < MIN_CONCEPTS) return { conceptMap: null, issue: 'OpenAI returned too few valid concepts.' }

  const seenIds = new Set()
  const uniqueConcepts = []
  for (const concept of concepts) {
    if (seenIds.has(concept.id)) continue
    seenIds.add(concept.id)
    uniqueConcepts.push(concept)
  }

  if (uniqueConcepts.length < MIN_CONCEPTS) {
    return { conceptMap: null, issue: 'OpenAI returned duplicate-heavy concepts.' }
  }

  const validIds = new Set(uniqueConcepts.map((concept) => concept.id))
  const relationships = (Array.isArray(value.relationships) ? value.relationships : [])
    .map(normalizeRelationship)
    .filter((relationship) => (
      relationship &&
      validIds.has(relationship.from) &&
      validIds.has(relationship.to)
    ))
    .slice(0, MAX_CONCEPTS * 2)

  const prerequisiteTargets = new Set(
    relationships
      .filter((relationship) => relationship.type === 'prerequisite')
      .map((relationship) => relationship.to),
  )
  const rootCount = uniqueConcepts.filter((concept) => !prerequisiteTargets.has(concept.id)).length
  if (rootCount === 0) return { conceptMap: null, issue: 'OpenAI returned no starter concept.' }

  return {
    conceptMap: {
      topic,
      bigIdea,
      audience,
      concepts: uniqueConcepts,
      relationships,
      generationNotes: safeString(value.generationNotes, 240) || undefined,
    },
    issue: '',
  }
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  const body = readJsonBody(request)
  const topic = safeString(body.topic, 80)
  const audience = safeString(body.audience, 60) || '3rd grade'
  const goal = safeString(body.goal, 240)
  const apiKey = getOpenAiApiKey()

  if (!topic) {
    response.status(400).json({ error: 'Topic is required.' })
    return
  }

  if (!apiKey) {
    response.status(200).json(fallbackResponse('OPENAI_API_KEY is missing in the API environment.'))
    return
  }

  try {
    const result = await requestOpenAiJson({
      apiKey,
      model: process.env.OPENAI_SCHEMA_MODEL || process.env.OPENAI_THEME_MODEL || 'gpt-4.1-mini',
      system:
        'You design curriculum concept maps for a Brilliant-style 3rd-grade learning app. Return valid JSON only. Generate only a schema outline: node topics, learning goals, kid-friendly descriptions, and relationship reasoning. Do not write lesson material, code, quizzes, or long explanations.',
      user: JSON.stringify({
        task:
          'Return JSON with keys topic, bigIdea, audience, concepts, relationships, and generationNotes. Create 4-10 concepts. Each concept needs id, label, shortLabel, topic, learningGoal, kidDescription, and difficulty from 1 to 5. Each relationship needs from, to, type, and reason. Relationship type must be prerequisite, related, deepening, or transfer. Include at least one starter/root concept with no prerequisite incoming edge.',
        topic,
        audience,
        goal,
      }),
    })

    const normalized = normalizeConceptMap(result, audience)
    if (!normalized.conceptMap) {
      response.status(200).json(fallbackResponse(normalized.issue))
      return
    }

    response.status(200).json({
      conceptMap: normalized.conceptMap,
      source: 'generated',
    })
  } catch (error) {
    response.status(200).json(fallbackResponse(
      error instanceof Error ? error.message : 'Unknown OpenAI concept map error.',
    ))
  }
}
