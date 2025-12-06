
import { GoogleGenAI, Type } from "@google/genai";
import { Article, Bias, BotCheckResult, EntityReport } from "../types";

// Helper to get client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey });
};

// --- Bot Detection Service ---

export const analyzeBotContent = async (text: string): Promise<BotCheckResult> => {
  try {
    const ai = getClient();
    const prompt = `Analyze this social media text (Context: Bangladesh Politics). Detect if it is a bot/coordinated campaign.
    Look for: 
    - Copy-paste content identical to known political cells (BAL/BNP cyber wings).
    - Unnatural praise or attack patterns.
    - New account indicators or 'phone number' usernames.
    
    Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isBot: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER, description: "0-100" },
            reasoning: { type: Type.STRING },
            flags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as BotCheckResult;
    }
    throw new Error("No response");
  } catch (error) {
    return {
      isBot: false,
      confidence: 0,
      reasoning: "Analysis failed. Please try again.",
      flags: []
    };
  }
};

// --- News Analysis ---

export const generateNewsFeed = async (topic?: string | null): Promise<Article[]> => {
  try {
    const ai = getClient();
    
    let basePrompt = `Generate 6 realistic, high-contrast news summaries for Bangladesh today.`;
    if (topic) {
        basePrompt = `Generate a timeline of news specifically about "${topic}". Include 2 recent, 2 from last month, 2 from last year.`;
    }

    const prompt = `${basePrompt}
    
    Use these specific sources and biases:
    - PRO_AL: Janakantha, Somoy TV, Ekattor TV, BSS.
    - PRO_BNP: Naya Diganta, Amar Desh, Dinkal.
    - PRO_STUDENT/NEUTRAL: Daily Star, Prothom Alo (sometimes), New Age.
    - INDIA: Anandabazar, Republic Bangla.
    - WESTERN: Al Jazeera, DW, BBC.

    Identify 'Dark Pool' stories: Viral on Facebook but ignored by mainstream media. Mark 1 article as isDarkPool=true.

    Response format: JSON Array of Articles.
    Sources must include an 'ownership' field (e.g. "Beximco", "Jamuna Group", "State").
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              imageUrl: { type: Type.STRING, description: "https://picsum.photos/800/400?random=NUMBER" },
              blindspot: { type: Type.STRING, enum: ["PRO_AL", "PRO_BNP", "PRO_JAMAAT", "PRO_STUDENT", "STATE", "INDIA", "NEUTRAL", "WESTERN", "NONE"] },
              isFactChecked: { type: Type.BOOLEAN },
              factCheckVerdict: { type: Type.STRING, enum: ["TRUE", "FALSE", "MISLEADING", "COMPLEX"] },
              isDarkPool: { type: Type.BOOLEAN },
              sources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    bias: { type: Type.STRING, enum: ["PRO_AL", "PRO_BNP", "PRO_JAMAAT", "PRO_STUDENT", "STATE", "INDIA", "NEUTRAL", "WESTERN"] },
                    reliabilityScore: { type: Type.NUMBER },
                    url: { type: Type.STRING },
                    ownership: { type: Type.STRING }
                  }
                }
              },
              topics: { type: Type.ARRAY, items: { type: Type.STRING } },
              timestamp: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      const rawData = JSON.parse(response.text);
      return rawData.map((item: any) => ({
        ...item,
        timestamp: item.timestamp || new Date().toISOString()
      }));
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// --- Entity Intelligence Report ---

export const generateEntityReport = async (topic: string): Promise<EntityReport | null> => {
  try {
    const ai = getClient();
    
    const prompt = `Generate a Media Intelligence Report for "${topic}" in Bangladesh.
    
    1. **Narratives**: Identify the "Dominant Narrative" (what mainstream says) and "Counter Narrative" (what opposition/social media says).
    2. **Bias Dist**: Percentage coverage by PRO_AL, PRO_BNP, PRO_JAMAAT, INDIA, NEUTRAL.
    3. **Bot Activity**: 0-100 score.
    4. **Articles**: 6 articles (include Dark Pool stories if relevant).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            summary: { type: Type.STRING },
            mentionTrend: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, value: { type: Type.NUMBER } } }
            },
            botActivity: { type: Type.NUMBER },
            dominantNarrative: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    supportedBy: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            },
            counterNarrative: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    supportedBy: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            },
            biasDistribution: {
              type: Type.OBJECT,
              properties: {
                PRO_AL: { type: Type.NUMBER },
                PRO_BNP: { type: Type.NUMBER },
                PRO_JAMAAT: { type: Type.NUMBER },
                PRO_STUDENT: { type: Type.NUMBER },
                INDIA: { type: Type.NUMBER },
                NEUTRAL: { type: Type.NUMBER },
                STATE: { type: Type.NUMBER },
                WESTERN: { type: Type.NUMBER },
              }
            },
            articles: {
               type: Type.ARRAY,
               items: {
                 type: Type.OBJECT,
                 properties: {
                    id: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    imageUrl: { type: Type.STRING },
                    blindspot: { type: Type.STRING, enum: ["PRO_AL", "PRO_BNP", "PRO_JAMAAT", "PRO_STUDENT", "STATE", "INDIA", "NEUTRAL", "WESTERN", "NONE"] },
                    isFactChecked: { type: Type.BOOLEAN },
                    factCheckVerdict: { type: Type.STRING },
                    isDarkPool: { type: Type.BOOLEAN },
                    timestamp: { type: Type.STRING },
                    sources: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            bias: { type: Type.STRING, enum: ["PRO_AL", "PRO_BNP", "PRO_JAMAAT", "PRO_STUDENT", "STATE", "INDIA", "NEUTRAL", "WESTERN"] },
                            reliabilityScore: { type: Type.NUMBER },
                            url: { type: Type.STRING },
                            ownership: { type: Type.STRING }
                          }
                        }
                    },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } }
                 }
               }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as EntityReport;
    }
    return null;

  } catch (error) {
    console.error(error);
    return null;
  }
};
