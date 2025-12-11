import { GoogleGenAI, GenerateContentResult, Content, Part } from "@google/genai";
import { Message } from "../types";

// Safety-first system instruction
const SYSTEM_INSTRUCTION = `
You are the "AI Doctor Companion", a professional, safe, and educational health assistant.

CRITICAL PROTOCOLS (MUST FOLLOW):
1. **NON-DIAGNOSTIC**: You CANNOT diagnose medical conditions. Never say "You have X". Instead say "Symptoms like yours are often associated with X, Y, or Z."
2. **NO PRESCRIPTIONS**: Do not recommend prescription medications. You may mention common OTC (Over-The-Counter) options for symptom relief (e.g., "Acetaminophen is often used for fever"), but always add a caution to read labels and consult a pharmacist.
3. **EMERGENCY RED FLAGS**: If a user describes life-threatening symptoms (crushing chest pain, severe difficulty breathing, profuse bleeding, signs of stroke, severe allergic reaction), your response MUST start with: "**⚠️ EMERGENCY: Please call emergency services (911 or local equivalent) immediately.**"
4. **SPECIALIST RECOMMENDATION**: When analyzing symptoms, actively suggest which medical specialist the user should visit (e.g., Dermatologist, Cardiologist, Orthopedist).
5. **FIRST AID**: Provide standard, step-by-step first aid instructions based on Red Cross/AHA guidelines when asked.
6. **LOCAL RESOURCES**: If the user asks for a doctor, hospital, or pharmacy, use the 'googleMaps' tool to find real locations near them.
7. **TONE**: Calm, empathetic, professional, clear, and reassuring. Use Markdown for readability.

Your goal is to bridge the gap between uncertainty and professional care.
`;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  history: Message[],
  userMessage: string,
  location?: GeolocationCoordinates
): Promise<{ text: string; groundingMetadata?: any }> => {
  try {
    // Format history for the API
    const contents: Content[] = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content } as Part],
    }));

    // Add the new user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage } as Part],
    });

    const modelId = 'gemini-3-pro-preview'; // Using 3 Pro for complex reasoning/medical context

    // Configure tools
    const tools: any[] = [{ googleMaps: {} }];
    let toolConfig: any = undefined;

    // If we have location data, pass it to the retrieval config for better local results
    if (location) {
      toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
    }

    const response: GenerateContentResult = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools,
        toolConfig: toolConfig,
        temperature: 0.4, // Lower temperature for more factual/consistent responses
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      },
    });

    // Check for safety blocks or empty responses
    if (response.promptFeedback?.blockReason) {
      throw new Error(`Content blocked for safety: ${response.promptFeedback.blockReason}`);
    }

    const candidate = response.candidates?.[0];
    
    if (candidate?.finishReason === 'SAFETY') {
       throw new Error("The AI response was flagged for safety concerns and cannot be displayed.");
    }

    const text = candidate?.content?.parts?.map(p => p.text).join('');
    
    if (!text) {
        throw new Error("The model returned an empty response.");
    }

    const groundingMetadata = candidate?.groundingMetadata;

    return { text, groundingMetadata };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMessage = "I apologize, but I'm having trouble connecting right now.";
    
    if (error.message.includes("SAFETY") || error.message.includes("blocked")) {
        errorMessage = "I cannot fulfill this request due to safety guidelines. Please ensure your query does not violate our policies regarding dangerous or harmful content.";
    } else if (error.message.includes("429")) {
        errorMessage = "I am receiving too many requests at the moment. Please try again in a few seconds.";
    }

    throw new Error(errorMessage);
  }
};