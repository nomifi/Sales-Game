
export const GAME_SPEED = 2.5;
export const JUMP_FORCE = 14;
export const GRAVITY = 0.6;
export const BLOCK_WIDTH = 380;

export interface SalesStage {
  id: string;
  title: string;
  role: string;
  color: string;
  pains: string[];
}

export const SALES_FLOW: SalesStage[] = [
  // --- SDR PHASE ---
  {
    id: 'sdr-1',
    title: 'Prospecting',
    role: 'SDR',
    color: 'bg-yellow-500',
    pains: ['Bad Data', 'Burnout', 'Junk MQLs']
  },
  {
    id: 'sdr-2',
    title: 'Qualification',
    role: 'SDR',
    color: 'bg-yellow-500',
    pains: ['Ghosting', 'No Budget', 'Fatigue']
  },
  {
    id: 'sdr-3',
    title: 'SDR-to-AE Handoff',
    role: 'SDR/AE',
    color: 'bg-yellow-600',
    pains: ['Dropped Baton', 'Poor Context', 'Re-qualifying']
  },
  // --- AE PHASE ---
  {
    id: 'ae-1',
    title: 'Discovery',
    role: 'AE',
    color: 'bg-orange-500',
    pains: ['Happy Ears', 'Interrogation', 'Surface Level']
  },
  {
    id: 'ae-2',
    title: 'Solution/Demo',
    role: 'AE',
    color: 'bg-orange-500',
    pains: ['Generic Demo', 'Feature Dump', 'No ROI']
  },
  {
    id: 'ae-3',
    title: 'Negotiation',
    role: 'AE',
    color: 'bg-orange-600',
    pains: ['Procurement', 'Legal Stalls', 'Discounting']
  },
  // --- CS PHASE ---
  {
    id: 'cs-1',
    title: 'Closing',
    role: 'AE/Finance',
    color: 'bg-green-600',
    pains: ['RFP']
  },
  {
    id: 'cs-2',
    title: 'Onboarding',
    role: 'CS',
    color: 'bg-blue-500',
    pains: ['Shelf-ware', 'Slow Ramp', 'Buyer Remorse']
  },
  {
    id: 'cs-3',
    title: 'Renewal',
    role: 'CS',
    color: 'bg-blue-600',
    pains: ['Churn Risk', 'No Upsell', 'Competitor']
  }
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