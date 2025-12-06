
export enum Bias {
  PRO_AL = 'PRO_AL',           // Awami League Aligned
  PRO_BNP = 'PRO_BNP',         // BNP Aligned
  PRO_JAMAAT = 'PRO_JAMAAT',   // Jamaat/Islamic Aligned
  PRO_STUDENT = 'PRO_STUDENT', // Student Coordinator/Reformist
  STATE = 'STATE',             // State Media (BTV, BSS)
  INDIA = 'INDIA',             // Indian Narrative
  NEUTRAL = 'NEUTRAL',         // Independent/Fact-based
  WESTERN = 'WESTERN'          // Western Media
}

export interface Source {
  id: string;
  name: string;
  bias: Bias;
  reliabilityScore: number; // 0-100
  url: string;
  ownership?: string; // e.g., "Beximco Group", "State Owned"
}

export interface Article {
  id: string;
  headline: string;
  summary: string;
  imageUrl: string;
  sources: Source[];
  blindspot?: Bias | 'NONE'; 
  timestamp: string;
  topics: string[];
  isFactChecked: boolean;
  factCheckVerdict?: 'TRUE' | 'FALSE' | 'MISLEADING' | 'COMPLEX';
  isDarkPool?: boolean; // If true, viral on FB but ignored by mainstream
}

export interface BotCheckResult {
  isBot: boolean;
  confidence: number;
  reasoning: string;
  flags: string[];
}

export interface MentionPoint {
  date: string;
  value: number; 
}

export interface Narrative {
  name: string;
  description: string;
  supportedBy: Bias[];
}

export interface EntityReport {
  topic: string;
  summary: string;
  mentionTrend: MentionPoint[];
  botActivity: number; // 0-100
  dominantNarrative: Narrative;
  counterNarrative: Narrative;
  biasDistribution: Record<Bias, number>;
  articles: Article[];
}
