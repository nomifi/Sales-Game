
import { SalesStage } from './types';

export const GAME_SPEED = 2.5;
export const JUMP_FORCE = 9.5; // Lower force but combined with low gravity = long floaty jump
export const GRAVITY = 0.25;   // Very low gravity for "moon jump" feel
export const BLOCK_WIDTH = 380;

export const SALES_FLOW: SalesStage[] = [
  // 1. Prospecting & Leadgen (3 blocks, Size 1)
  {
    id: 'prop-1',
    title: 'Prospecting',
    role: 'SDR',
    color: 'bg-yellow-500',
    pains: ['Identification'],
    difficulty: 1
  },
  {
    id: 'prop-2',
    title: 'Prospecting',
    role: 'SDR',
    color: 'bg-yellow-500',
    pains: ['ICP Match'],
    difficulty: 1
  },
  {
    id: 'prop-3',
    title: 'Prospecting',
    role: 'SDR',
    color: 'bg-yellow-500',
    pains: ['Cold Outreach'],
    difficulty: 1
  },

  // 2. Contact & Qualification (2 blocks, Size 1)
  {
    id: 'qual-1',
    title: 'Qualification',
    role: 'SDR',
    color: 'bg-yellow-600',
    pains: ['Bounced'],
    difficulty: 1
  },
  {
    id: 'qual-2',
    title: 'Qualification',
    role: 'SDR',
    color: 'bg-yellow-600',
    pains: ['Ghosted'],
    difficulty: 1
  },

  // 3. Handoff to AE (1 block, Size 2)
  {
    id: 'handoff-1',
    title: 'SDR > AE Handoff',
    role: 'SDR/AE',
    color: 'bg-orange-400',
    pains: ['Lead Disqualified'],
    difficulty: 2
  },

  // 4. Discovery (2 blocks, Size 2)
  {
    id: 'disc-1',
    title: 'Discovery',
    role: 'AE',
    color: 'bg-orange-500',
    pains: ['Unclear Budget'],
    difficulty: 2
  },
  {
    id: 'disc-2',
    title: 'Discovery',
    role: 'AE',
    color: 'bg-orange-500',
    pains: ['No Decision Power'],
    difficulty: 2
  },

  // 5. Demo (2 blocks, Size 2)
  {
    id: 'demo-1',
    title: 'Solution Demo',
    role: 'AE',
    color: 'bg-orange-600',
    pains: ['Product Workaround'],
    difficulty: 2
  },
  {
    id: 'demo-2',
    title: 'Solution Demo',
    role: 'AE',
    color: 'bg-orange-600',
    pains: ['Generic Demo'],
    difficulty: 2
  },

  // 6. Objection Handling (1 block, Size 2)
  {
    id: 'obj-1',
    title: 'Objection Handling',
    role: 'AE',
    color: 'bg-red-500',
    pains: ['6 Stakeholders'],
    difficulty: 2
  },

  // 7. Negotiation and Close (1 block, Size 4 - IMPOSSIBLE)
  {
    id: 'neg-1',
    title: 'Negotiation',
    role: 'AE',
    color: 'bg-red-600',
    pains: ['RFP'],
    difficulty: 4
  },

  // 8. Onboarding (2 blocks, Size 2)
  {
    id: 'onb-1',
    title: 'Onboarding',
    role: 'CS',
    color: 'bg-blue-500',
    pains: ['Slow Ramp'],
    difficulty: 2
  },
  {
    id: 'onb-2',
    title: 'Onboarding',
    role: 'CS',
    color: 'bg-blue-500',
    pains: ['Buyer Remorse'],
    difficulty: 2
  },

  // 9. Renewal (3 blocks, Size 2)
  {
    id: 'ren-1',
    title: 'Renewal',
    role: 'CS',
    color: 'bg-blue-600',
    pains: ['Churn Risk'],
    difficulty: 2
  },
  {
    id: 'ren-2',
    title: 'Renewal',
    role: 'CS',
    color: 'bg-blue-600',
    pains: ['No Upsell'],
    difficulty: 2
  },
  {
    id: 'ren-3',
    title: 'Renewal',
    role: 'CS',
    color: 'bg-blue-600',
    pains: ['Competitor'],
    difficulty: 2
  },
];

export const SYSTEM_PROMPT_TEMPLATE = `
You are a renowned Sales Thought Leader and Coach.
A user has just played through a game simulating a sales process and provided feedback on whether it matches their reality.

User's Feedback: "{feedback}"
User's Validated Flow Status: "{status}" (Correct or Incorrect)

Your goal:
1. Acknowledge their perspective.
2. If they said the flow is WRONG, validate their insight (make them feel smart for spotting the gap).
3. Provide a brief, high-level insight about modern sales processes that relates to their feedback.
4. Keep it professional, encouraging, and concise (max 3 sentences).
`;
