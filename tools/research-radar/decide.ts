import { GATES, LANE_LABELS } from './questions.ts'
import type { Decision, Judgment, RadarItem, RadarLane } from './types.ts'

const LANE_WHY: Record<RadarLane, string> = {
  work: 'This can change a live marketing decision.',
  learn_ai: 'This teaches an AI or agent mechanism he can apply.',
  learn_security:
    'This is an account, consent, or brand risk a marketer can act on.',
  learn_networking:
    'This is delivery, DNS, or email authentication he can brief.',
}

const LANE_MOVE: Record<RadarLane, string> = {
  work: 'Check this against one live account and name the metric it would move.',
  learn_ai:
    'Spend 20 minutes on the mechanism, then name one marketing task it can take.',
  learn_security:
    'Write the marketer action: account access, consent, or brand. Stop before any exploit detail.',
  learn_networking: 'Write the one question you would ask engineering.',
}

function laneOn(probability: number): boolean {
  return probability >= GATES.lane
}

export function decide(item: RadarItem, judgment: Judgment): Decision {
  const answers = judgment.answers
  const lanes: Array<RadarLane> = []
  if (laneOn(answers.relevant_to_work.noul)) lanes.push('work')
  if (laneOn(answers.learn_ai.noul)) lanes.push('learn_ai')
  if (laneOn(answers.learn_security.noul)) lanes.push('learn_security')
  if (laneOn(answers.learn_networking.noul)) lanes.push('learn_networking')

  const hype = answers.is_hype.noul
  const work = answers.relevant_to_work.noul
  const dropForHype = hype >= GATES.hypeSkip && work < GATES.workKeepsHype
  const action = lanes.length === 0 || dropForHype ? 'skip' : 'keep'
  const keptLanes = action === 'keep' ? lanes : []
  const leverage =
    action === 'skip'
      ? 0
      : (keptLanes.includes('work') ? 5 : 0) +
        (keptLanes.includes('learn_security') ? 3 : 0) +
        (keptLanes.includes('learn_ai') ? 2 : 0) +
        (keptLanes.includes('learn_networking') ? 2 : 0) +
        answers.time_to_use.score

  return {
    id: item.id,
    source: item.source,
    title: item.title.trim(),
    text: item.text.trim(),
    url: item.url,
    author: item.author,
    action,
    lanes: keptLanes,
    lessonScore: answers.worth_a_lesson.score,
    timeToUse: answers.time_to_use.score,
    hypeProbability: hype,
    workProbability: work,
    leverage,
    why:
      keptLanes.length > 0
        ? keptLanes.map((lane) => LANE_WHY[lane]).join(' ')
        : 'Nothing here changes his work or his learning list.',
    move:
      keptLanes.length > 0
        ? keptLanes
            .slice(0, 2)
            .map((lane) => LANE_MOVE[lane])
            .join(' ')
        : 'Skip.',
  }
}

export function laneLabel(lane: RadarLane): string {
  return LANE_LABELS[lane]
}
