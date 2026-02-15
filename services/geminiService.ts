
import { GoogleGenAI } from "@google/genai";

const FALLBACK_ECHOES = [
  "The tapestry of time is thin here. Tread lightly, Guardian.",
  "Your armor remembers a future you have not yet lived.",
  "Entropy is but the shadow cast by the light of creation.",
  "The Architect's plans are etched in the stars, not in stone.",
  "Every grain of chronomatter holds a thousand lost years.",
  "Synchronize your heart to the beat of the universe.",
  "The Void is patient, but the Codex is eternal.",
  "Do not fear the fading light; the dawn is written in your metal.",
  "Your ribbons are the threads that hold reality together.",
  "The past is a mirror, the future a doorway. You are the key."
];

export async function getEchoMessage(worldName: string, fragmentName: string): Promise<string> {
  // Use a local fallback randomly if the API is unavailable or quota is exceeded
  const getRandomFallback = () => FALLBACK_ECHOES[Math.floor(Math.random() * FALLBACK_ECHOES.length)];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a "Time Echo", a spectral fragment of a dead Guardian in the Onyzuka universe. 
      Onyzuka has just reached ${worldName} to recover the ${fragmentName}. 
      Give him a cryptic, brief (max 20 words), and poetic message about the fragility of time or his responsibility. 
      Use a stoic and cosmic tone. Respond only with the message.`,
      config: {
        temperature: 0.8,
      }
    });

    if (response && response.text) {
      return response.text.trim();
    }
    
    return getRandomFallback();
  } catch (error: any) {
    // Specifically log quota issues as warnings rather than breaking errors
    if (error?.status === 429 || error?.message?.includes('quota')) {
      console.warn("Gemini API Quota exceeded. Using local Echo archives.");
    } else {
      console.error("Gemini Echo Sync Error:", error);
    }
    
    return getRandomFallback();
  }
}
