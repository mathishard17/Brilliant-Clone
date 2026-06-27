import {
  LESSON_1_ID,
  LESSON_2_ID,
  LESSON_3_ID,
  LESSON_4_ID,
  LESSON_5_ID,
  LESSON_6_ID,
  LESSON_7_ID,
  LESSON_8_ID,
  LESSON_9_ID,
  LESSON_10_ID,
  LESSON_11_ID,
  LESSON_12_ID,
  LESSON_13_ID,
  type LessonProgress,
} from './lesson'
import type { StudentMemory } from './user'

export type KnowledgeNodeId =
  | 'counting_choices'
  | 'ordered_arrangements'
  | 'groups_without_order'
  | 'chance_as_fraction'
  | 'fairness_sample_space'
  | 'sample_space_trees'
  | 'compound_chance'
  | 'experimental_probability'
  | 'equal_groups_arrays'
  | 'skip_counting'
  | 'base_10_bundling'
  | 'magnitude_estimation'
  | 'transfer_missions'

export type KnowledgeEdgeRelationship =
  | 'prerequisite'
  | 'related'
  | 'transfer'
  | 'deepening'

export type NodeMasteryStatus = 'locked' | 'available' | 'inProgress' | 'completed' | 'mastered'

export type KnowledgeSchemaId =
  | 'counting_probability'
  | 'number_structure'
  | 'transfer_schema'

export interface KnowledgeSchema {
  id: KnowledgeSchemaId
  label: string
  shortLabel: string
  description: string
  neonColor: string
  nodeIds: KnowledgeNodeId[]
}

export interface KnowledgeNode {
  id: KnowledgeNodeId
  schemaId: KnowledgeSchemaId
  label: string
  shortLabel: string
  skill: string
  description: string
  lessonId: string
  /** Open from day one without prerequisite progress. */
  isStarter?: boolean
  unlockedBy: KnowledgeNodeId[]
  mapPosition: {
    x: number
    y: number
  }
}

export interface KnowledgeEdge {
  id: string
  from: KnowledgeNodeId
  to: KnowledgeNodeId
  relationship: KnowledgeEdgeRelationship
}

export interface NodeMasteryState {
  status: NodeMasteryStatus
  contextsTried: string[]
  progressRatio: number
}

export interface KnowledgeLessonBridge {
  id: string
  graphNodeId: KnowledgeNodeId
  progressSteps: readonly string[]
  available?: boolean
}

export const KNOWLEDGE_SCHEMAS: KnowledgeSchema[] = [
  {
    id: 'counting_probability',
    label: 'Counting + Probability Schema',
    shortLabel: 'Counting / Chance',
    description:
      'This schema connects counting choices, order, groups, chance, fairness, outcome trees, compound chance, and experiments.',
    neonColor: '#22d3ee',
    nodeIds: [
      'counting_choices',
      'ordered_arrangements',
      'groups_without_order',
      'chance_as_fraction',
      'fairness_sample_space',
      'sample_space_trees',
      'compound_chance',
      'experimental_probability',
    ],
  },
  {
    id: 'number_structure',
    label: 'Number Structure Schema',
    shortLabel: 'Number Structure',
    description:
      'Future lessons grow a second schema for equal groups, skip counting, bundling, and estimating magnitude.',
    neonColor: '#a78bfa',
    nodeIds: ['equal_groups_arrays', 'skip_counting', 'base_10_bundling', 'magnitude_estimation'],
  },
  {
    id: 'transfer_schema',
    label: 'Transfer Schema',
    shortLabel: 'Transfer',
    description:
      'Transfer missions connect schemas so learners can use the same structure in new real-world worlds.',
    neonColor: '#f472b6',
    nodeIds: ['transfer_missions'],
  },
]

export const KNOWLEDGE_NODES: KnowledgeNode[] = [
  {
    id: 'counting_choices',
    schemaId: 'counting_probability',
    label: 'Counting Choices',
    shortLabel: 'Choices',
    skill: 'Multiply independent choices to count combinations.',
    description: 'Build all possible outfits by choosing one item from each category.',
    lessonId: LESSON_1_ID,
    isStarter: true,
    unlockedBy: [],
    mapPosition: { x: 24, y: 36 },
  },
  {
    id: 'ordered_arrangements',
    schemaId: 'counting_probability',
    label: 'Ordered Arrangements',
    shortLabel: 'Order',
    skill: 'Count arrangements when order matters.',
    description: 'Arrange items in different orders and discover factorial patterns.',
    lessonId: LESSON_2_ID,
    unlockedBy: ['counting_choices'],
    mapPosition: { x: 38, y: 29 },
  },
  {
    id: 'groups_without_order',
    schemaId: 'counting_probability',
    label: 'Groups Without Order',
    shortLabel: 'Groups',
    skill: 'Choose groups while avoiding repeated arrangements.',
    description: 'See why the same group should only be counted once.',
    lessonId: LESSON_3_ID,
    unlockedBy: ['ordered_arrangements'],
    mapPosition: { x: 54, y: 29 },
  },
  {
    id: 'chance_as_fraction',
    schemaId: 'counting_probability',
    label: 'Chance',
    shortLabel: 'Chance',
    skill: 'Compare favorable outcomes with total outcomes.',
    description: 'Use spinner spaces to reason about likely and unlikely events.',
    lessonId: LESSON_4_ID,
    isStarter: true,
    unlockedBy: ['groups_without_order'],
    mapPosition: { x: 68, y: 36 },
  },
  {
    id: 'fairness_sample_space',
    schemaId: 'counting_probability',
    label: 'Fairness',
    shortLabel: 'Fairness',
    skill: 'List sample spaces and judge whether games are fair.',
    description: 'Check every possible outcome before deciding if a game is balanced.',
    lessonId: LESSON_5_ID,
    unlockedBy: ['chance_as_fraction'],
    mapPosition: { x: 68, y: 55 },
  },
  {
    id: 'sample_space_trees',
    schemaId: 'counting_probability',
    label: 'Sample Space Trees',
    shortLabel: 'Trees',
    skill: 'Organize multi-step outcomes with branches.',
    description: 'A future node for tree diagrams and structured outcome paths.',
    lessonId: LESSON_11_ID,
    unlockedBy: ['fairness_sample_space'],
    mapPosition: { x: 54, y: 67 },
  },
  {
    id: 'compound_chance',
    schemaId: 'counting_probability',
    label: 'Compound Chance',
    shortLabel: 'Compound',
    skill: 'Reason about two chance events happening together.',
    description: 'A future node for combining outcomes across repeated or linked events.',
    lessonId: LESSON_12_ID,
    unlockedBy: ['sample_space_trees'],
    mapPosition: { x: 38, y: 67 },
  },
  {
    id: 'experimental_probability',
    schemaId: 'counting_probability',
    label: 'Experimental Probability',
    shortLabel: 'Trials',
    skill: 'Compare predicted chance with repeated trials.',
    description: 'A future node for running trials and comparing data to expected outcomes.',
    lessonId: LESSON_13_ID,
    unlockedBy: ['compound_chance'],
    mapPosition: { x: 24, y: 55 },
  },
  {
    id: 'equal_groups_arrays',
    schemaId: 'number_structure',
    label: 'Equal Groups & Arrays',
    shortLabel: 'Arrays',
    skill: 'Use rows, columns, and equal groups as multiplication foundations.',
    description: 'A future node for grid and row-counting missions.',
    lessonId: LESSON_6_ID,
    unlockedBy: ['counting_choices'],
    mapPosition: { x: 30, y: 76 },
  },
  {
    id: 'skip_counting',
    schemaId: 'number_structure',
    label: 'Skip Counting',
    shortLabel: 'Skip Count',
    skill: 'Count by equal jumps such as 2s, 5s, and 10s.',
    description: 'A future node for repeated-jump paths and grouped objects.',
    lessonId: LESSON_7_ID,
    unlockedBy: ['equal_groups_arrays'],
    mapPosition: { x: 41, y: 84 },
  },
  {
    id: 'base_10_bundling',
    schemaId: 'number_structure',
    label: 'Base-10 Bundling',
    shortLabel: 'Bundling',
    skill: 'Bundle ten loose items into one ten.',
    description: 'A future node for place-value packing and regrouping.',
    lessonId: LESSON_8_ID,
    unlockedBy: ['skip_counting'],
    mapPosition: { x: 53, y: 84 },
  },
  {
    id: 'magnitude_estimation',
    schemaId: 'number_structure',
    label: 'Scale & Magnitude',
    shortLabel: 'Estimate',
    skill: 'Estimate and compare larger sets.',
    description: 'A future node for deciding what is small, medium, huge, or close.',
    lessonId: LESSON_9_ID,
    unlockedBy: ['base_10_bundling'],
    mapPosition: { x: 62, y: 76 },
  },
  {
    id: 'transfer_missions',
    schemaId: 'transfer_schema',
    label: 'Transfer Missions',
    shortLabel: 'Transfer',
    skill: 'Apply the same structure in a new real-world context.',
    description: 'A future node for connecting math ideas across different worlds.',
    lessonId: LESSON_10_ID,
    unlockedBy: ['experimental_probability', 'magnitude_estimation'],
    mapPosition: { x: 80, y: 50 },
  },
]

export const KNOWLEDGE_EDGES: KnowledgeEdge[] = [
  { id: 'choices-to-order', from: 'counting_choices', to: 'ordered_arrangements', relationship: 'prerequisite' },
  { id: 'order-to-groups', from: 'ordered_arrangements', to: 'groups_without_order', relationship: 'prerequisite' },
  { id: 'groups-to-chance', from: 'groups_without_order', to: 'chance_as_fraction', relationship: 'prerequisite' },
  { id: 'choices-to-chance', from: 'counting_choices', to: 'chance_as_fraction', relationship: 'related' },
  { id: 'chance-to-fairness', from: 'chance_as_fraction', to: 'fairness_sample_space', relationship: 'prerequisite' },
  { id: 'fairness-to-trees', from: 'fairness_sample_space', to: 'sample_space_trees', relationship: 'deepening' },
  { id: 'trees-to-compound', from: 'sample_space_trees', to: 'compound_chance', relationship: 'deepening' },
  { id: 'compound-to-trials', from: 'compound_chance', to: 'experimental_probability', relationship: 'deepening' },
  { id: 'chance-to-trials', from: 'chance_as_fraction', to: 'experimental_probability', relationship: 'related' },
  { id: 'choices-to-arrays', from: 'counting_choices', to: 'equal_groups_arrays', relationship: 'related' },
  { id: 'arrays-to-skip', from: 'equal_groups_arrays', to: 'skip_counting', relationship: 'prerequisite' },
  { id: 'skip-to-bundling', from: 'skip_counting', to: 'base_10_bundling', relationship: 'deepening' },
  { id: 'bundling-to-estimation', from: 'base_10_bundling', to: 'magnitude_estimation', relationship: 'deepening' },
  { id: 'trials-to-transfer', from: 'experimental_probability', to: 'transfer_missions', relationship: 'transfer' },
  { id: 'estimation-to-transfer', from: 'magnitude_estimation', to: 'transfer_missions', relationship: 'transfer' },
  { id: 'groups-to-arrays', from: 'groups_without_order', to: 'equal_groups_arrays', relationship: 'related' },
  { id: 'order-to-skip', from: 'ordered_arrangements', to: 'skip_counting', relationship: 'related' },
  { id: 'chance-to-estimation', from: 'chance_as_fraction', to: 'magnitude_estimation', relationship: 'related' },
  { id: 'fairness-to-bundling', from: 'fairness_sample_space', to: 'base_10_bundling', relationship: 'related' },
]

export function getKnowledgeNodeById(nodeId: KnowledgeNodeId): KnowledgeNode {
  return KNOWLEDGE_NODES.find((node) => node.id === nodeId) ?? KNOWLEDGE_NODES[0]
}

export function getKnowledgeSchemaById(schemaId: KnowledgeSchemaId): KnowledgeSchema {
  return KNOWLEDGE_SCHEMAS.find((schema) => schema.id === schemaId) ?? KNOWLEDGE_SCHEMAS[0]
}

function hasMeaningfulProgress(progress: LessonProgress | undefined): boolean {
  if (!progress) return false
  if (progress.completed) return true
  if (progress.currentScreen > 0 || (progress.lastLessonScreen ?? 1) > 1) return true
  if (Object.keys(progress.sectionState ?? {}).length > 0) return true
  if (progress.screen1.answer !== null || progress.screen1.discoveredOutfits.length > 0) return true
  if (progress.screen2.currentStep > 1) return true
  if (progress.screen3.answer !== null || progress.screen3.discoveredOutfits.length > 0) return true
  return false
}

function calculateProgressRatio(
  progress: LessonProgress | undefined,
  progressSteps: readonly string[],
): number {
  if (!progress) return 0
  if (progress.completed) return 1
  const lastScreen = Math.max(progress.currentScreen, progress.lastLessonScreen ?? 1)
  const stepCount = Math.max(progressSteps.length, 1)
  return Math.min(Math.max((lastScreen - 1) / stepCount, 0), 0.95)
}

const WRONG_ATTEMPT_COMPLETED_ONLY_THRESHOLD = 3
const HINT_COMPLETED_ONLY_THRESHOLD = 1

function sumWrongAttemptsFromSectionState(value: unknown): number {
  if (!value || typeof value !== 'object') return 0
  if (Array.isArray(value)) {
    return value.reduce((total, entry) => total + sumWrongAttemptsFromSectionState(entry), 0)
  }

  return Object.entries(value as Record<string, unknown>).reduce((total, [key, entry]) => {
    const ownCount =
      key.toLowerCase().includes('wrongattempts') && typeof entry === 'number' && Number.isFinite(entry)
        ? Math.max(0, Math.floor(entry))
        : 0
    return total + ownCount + sumWrongAttemptsFromSectionState(entry)
  }, 0)
}

function countWrongAttempts(progress: LessonProgress | undefined): number {
  if (!progress) return 0
  return (
    progress.screen1.wrongAttempts +
    progress.screen3.wrongAttempts +
    sumWrongAttemptsFromSectionState(progress.sectionState)
  )
}

function countHintsForLesson(studentMemory: StudentMemory | undefined, lessonId: string): number {
  if (!studentMemory) return 0
  return Object.values(studentMemory.concepts).reduce((total, concept) => (
    concept.lessonId === lessonId ? total + concept.hintsRequested : total
  ), 0)
}

function completedWithSupport(
  progress: LessonProgress | undefined,
  studentMemory: StudentMemory | undefined,
  lessonId: string,
): boolean {
  if (progress?.completed !== true) return false
  return (
    countWrongAttempts(progress) >= WRONG_ATTEMPT_COMPLETED_ONLY_THRESHOLD ||
    countHintsForLesson(studentMemory, lessonId) >= HINT_COMPLETED_ONLY_THRESHOLD
  )
}

function hasCompletedPrerequisite(
  stateByNode: Partial<Record<KnowledgeNodeId, NodeMasteryState>>,
  nodeId: KnowledgeNodeId,
): boolean {
  const status = stateByNode[nodeId]?.status
  return status === 'completed' || status === 'mastered'
}

function isKnowledgeNodeUnlocked(
  node: KnowledgeNode,
  stateByNode: Partial<Record<KnowledgeNodeId, NodeMasteryState>>,
): boolean {
  if (node.isStarter || node.unlockedBy.length === 0) return true
  return node.unlockedBy.every((nodeId) => hasCompletedPrerequisite(stateByNode, nodeId))
}

export function canEnterKnowledgeNode(
  status: NodeMasteryStatus | undefined,
  lessonAvailable = true,
): boolean {
  return lessonAvailable && status !== undefined && status !== 'locked'
}

export function deriveKnowledgeGraphState({
  lessons,
  lessonDefinitions,
  activeThemeLabel,
  studentMemory,
}: {
  lessons: Record<string, LessonProgress>
  lessonDefinitions: KnowledgeLessonBridge[]
  activeThemeLabel?: string
  studentMemory?: StudentMemory
}): Record<KnowledgeNodeId, NodeMasteryState> {
  const lessonByNode = new Map<KnowledgeNodeId, KnowledgeLessonBridge>()
  lessonDefinitions.forEach((lesson) => {
    lessonByNode.set(lesson.graphNodeId, lesson)
  })

  const stateByNode = {} as Record<KnowledgeNodeId, NodeMasteryState>

  KNOWLEDGE_NODES.forEach((node) => {
    const lesson = lessonByNode.get(node.id)
    const progress = lesson ? lessons[lesson.id] : undefined
    const available = lesson?.available ?? true
    const completed = progress?.completed === true
    const shouldCompleteWithoutMastery = completedWithSupport(progress, studentMemory, node.lessonId)
    const attempted = hasMeaningfulProgress(progress)
    const unlocked = isKnowledgeNodeUnlocked(node, stateByNode)
    const hasSavedProgress = attempted || completed
    const status: NodeMasteryStatus = !available
      ? 'locked'
      : !unlocked && !hasSavedProgress
        ? 'locked'
        : completed
          ? shouldCompleteWithoutMastery
            ? 'completed'
            : 'mastered'
          : attempted
            ? 'inProgress'
            : 'available'

    stateByNode[node.id] = {
      status,
      contextsTried: attempted || completed ? [activeThemeLabel ?? 'Current World'] : [],
      progressRatio: calculateProgressRatio(progress, lesson?.progressSteps ?? []),
    }
  })

  return stateByNode
}
