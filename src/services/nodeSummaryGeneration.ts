import type { KnowledgeNode, NodeMasteryStatus } from '../types/knowledgeGraph'
import { postAiEndpoint } from './aiBackend'

export interface KnowledgeNodeSummary {
  title: string
  currentUnderstanding: string
  nextPractice: string
  encouragement: string
}

export interface GenerateKnowledgeNodeSummaryRequest {
  node: Pick<KnowledgeNode, 'id' | 'label' | 'skill' | 'description'>
  status: NodeMasteryStatus
  progressRatio: number
  contextsTried: string[]
  lessonTitle: string
  available: boolean
  activeThemeLabel?: string
  schemaLabel?: string
}

interface GenerateKnowledgeNodeSummaryResponse {
  summary: KnowledgeNodeSummary
  source: 'generated' | 'fallback'
}

function isSummaryString(value: unknown, maxLength: number) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength
}

function isValidNodeSummary(value: unknown): value is KnowledgeNodeSummary {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const summary = value as Partial<KnowledgeNodeSummary>
  return (
    isSummaryString(summary.title, 80) &&
    isSummaryString(summary.currentUnderstanding, 240) &&
    isSummaryString(summary.nextPractice, 220) &&
    isSummaryString(summary.encouragement, 160)
  )
}

function normalizeNodeSummary(summary: KnowledgeNodeSummary): KnowledgeNodeSummary {
  return {
    title: summary.title.trim(),
    currentUnderstanding: summary.currentUnderstanding.trim(),
    nextPractice: summary.nextPractice.trim(),
    encouragement: summary.encouragement.trim(),
  }
}

export function buildFallbackKnowledgeNodeSummary(
  request: GenerateKnowledgeNodeSummaryRequest,
): KnowledgeNodeSummary {
  const progressPercent = Math.round(Math.min(Math.max(request.progressRatio, 0), 1) * 100)
  const contextCopy =
    request.contextsTried.length > 0
      ? `You have tried this in ${request.contextsTried.join(', ')}.`
      : 'This node is ready for its first try.'

  if (request.status === 'mastered') {
    return {
      title: `${request.node.label} glow check`,
      currentUnderstanding: `You have a strong glow here: ${request.node.skill} ${contextCopy}`,
      nextPractice: `Try a new story problem that uses ${request.node.label.toLowerCase()} so the idea stays flexible.`,
      encouragement: 'You can use this skill in new worlds.',
    }
  }

  if (request.status === 'completed') {
    return {
      title: `${request.node.label} practice check`,
      currentUnderstanding: `You finished this node, and the coach noticed a few support moments. ${contextCopy}`,
      nextPractice: `Review ${request.lessonTitle} once more without hints to turn completion into mastery.`,
      encouragement: 'Finished is real progress. A little extra practice can make it glow.',
    }
  }

  if (request.status === 'inProgress') {
    return {
      title: `${request.node.label} progress check`,
      currentUnderstanding: `You have started this node and are about ${progressPercent}% through. ${contextCopy}`,
      nextPractice: `Practice the next step in ${request.lessonTitle}: ${request.node.skill}`,
      encouragement: 'A little more practice will brighten this node.',
    }
  }

  if (!request.available || request.status === 'locked') {
    return {
      title: `${request.node.label} preview`,
      currentUnderstanding: `This node is waiting until nearby skills are brighter. It will help with: ${request.node.skill}`,
      nextPractice: 'Practice the open nodes connected to this one, then come back when it unlocks.',
      encouragement: 'Every bright node makes the network easier to explore.',
    }
  }

  return {
    title: `${request.node.label} ready check`,
    currentUnderstanding: `This node is ready to start. It focuses on: ${request.node.skill}`,
    nextPractice: `Open ${request.lessonTitle} and try one careful example before speeding up.`,
    encouragement: 'Start small and watch the node light up.',
  }
}

export async function generateKnowledgeNodeSummary(
  request: GenerateKnowledgeNodeSummaryRequest,
): Promise<GenerateKnowledgeNodeSummaryResponse> {
  const fallback = buildFallbackKnowledgeNodeSummary(request)

  try {
    const result = await postAiEndpoint<
      GenerateKnowledgeNodeSummaryRequest,
      GenerateKnowledgeNodeSummaryResponse
    >('/api/generate-knowledge-node-summary', request)
    if (isValidNodeSummary(result.summary)) {
      return {
        summary: normalizeNodeSummary(result.summary),
        source: result.source === 'generated' ? 'generated' : 'fallback',
      }
    }
  } catch {
    // Node summaries are optional; local progress copy keeps the hub usable without AI.
  }

  return { summary: fallback, source: 'fallback' }
}
