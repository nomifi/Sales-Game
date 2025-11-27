
import { SalesStage } from './types';

export const GAME_SPEED = 4.5; // Faster pace
export const JUMP_FORCE = 10;  // Slightly adjusted for speed
export const GRAVITY = 0.35;   // Slightly stronger gravity for faster jumps
export const BLOCK_WIDTH = 400; // Good width for reading titles

export const SALES_FLOW: SalesStage[] = [
  // Prospecting - Yellow (#EAB308)
  { id: 's1', title: 'Wrong ICP', color: 'bg-yellow-500', hLevel: 0, wLevel: 0 },
  { id: 's2', title: 'Email Bounced', color: 'bg-yellow-500', hLevel: 0, wLevel: 0 },
  { id: 's3', title: 'Ghosted', color: 'bg-yellow-500', hLevel: 0, wLevel: 1 },

  // First Contact - Amber (#F59E0B)
  { id: 's4', title: 'No Budget', color: 'bg-amber-500', hLevel: 0, wLevel: 1 },
  { id: 's5', title: 'Send Me Info', color: 'bg-amber-500', hLevel: 0, wLevel: 1 },

  // Handoff - Orange (#F97316)
  { id: 's6', title: 'Lost Context', color: 'bg-orange-500', hLevel: 0, wLevel: 0 },

  // Discovery - Orange-Red (#FB923C)
  { id: 's7', title: 'Fake Champion', color: 'bg-orange-400', hLevel: 1, wLevel: 1 },
  { id: 's8', title: 'Happy with Current', color: 'bg-orange-400', hLevel: 0, wLevel: 1 },

  // Demo - Red (#EF4444)
  { id: 's9', title: 'Wrong Stakeholders', color: 'bg-red-500', hLevel: 0, wLevel: 1 },
  { id: 's10', title: 'Missing Feature', color: 'bg-red-500', hLevel: 1, wLevel: 0 },

  // Objections - Dark Red (#DC2626)
  { id: 's11', title: 'Price Too High', color: 'bg-red-600', hLevel: 0, wLevel: 1 },
  { id: 's12', title: 'I’ll Think About It', color: 'bg-red-600', hLevel: 0, wLevel: 1 },

  // Close - Crimson (#B91C1C)
  { id: 's13', title: 'RFP', color: 'bg-red-700', hLevel: 1, wLevel: 1 },
  { id: 's14', title: 'Legal Limbo', color: 'bg-red-700', hLevel: 1, wLevel: 1 },

  // Post-Sale - Blue (#3B82F6)
  { id: 's15', title: 'Champion Left', color: 'bg-blue-500', hLevel: 1, wLevel: 1 },
  { id: 's16', title: 'No Adoption', color: 'bg-blue-500', hLevel: 1, wLevel: 1 },

  // Renewal - Deep Blue (#2563EB)
  { id: 's17', title: 'Budget Cuts', color: 'bg-blue-600', hLevel: 1, wLevel: 0 },
  { id: 's18', title: 'Competitor Swoops', color: 'bg-blue-600', hLevel: 1, wLevel: 1 },
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