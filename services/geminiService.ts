import { GoogleGenAI, GenerateContentResponse, Content, Part } from "@google/genai";
import { Message } from "../types";

// Safety-first system instruction
const SYSTEM_INSTRUCTION = `
You are the "AI Doctor Companion", a professional, safe, and educational health assistant.

CRITICAL PROTOCOLS (MUST FOLLOW):
1. **NON-DIAGNOSTIC**: You CANNOT diagnose medical conditions. Never say "You have X". Instead say "Symptoms like yours are often associated with X, Y, or Z."
2. **VISUAL ANALYSIS**: If an image is provided, describe the visible symptoms objectively (e.g., "I see redness, raised bumps, and some swelling"). Do NOT diagnose the image (e.g., do not say "This is eczema"). Instead, suggest what conditions *could* present this way and recommend seeing a specialist.
3. **NO PRESCRIPTIONS**: Do not recommend prescription medications. You may mention common OTC (Over-The-Counter) options for symptom relief (e.g., "Acetaminophen is often used for fever"), but always add a caution to read labels and consult a pharmacist.
4. **EMERGENCY RED FLAGS**: If a user describes life-threatening symptoms (crushing chest pain, severe difficulty breathing, profuse bleeding, signs of stroke, severe allergic reaction), your response MUST start with: "**⚠️ EMERGENCY: Please call emergency services (911 or local equivalent) immediately.**"
5. **SPECIALIST RECOMMENDATION**: When analyzing symptoms, actively suggest which medical specialist the user should visit (e.g., Dermatologist, Cardiologist, Orthopedist).
6. **FIRST AID**: Provide standard, step-by-step first aid instructions based on Red Cross/AHA guidelines when asked.
7. **LOCAL RESOURCES**: If the user asks for a doctor, hospital, or pharmacy, use the 'googleMaps' tool to find real locations near them.
8. **TONE & LANGUAGE**: Calm, empathetic, professional, and reassuring. **Use Simple US English**. Avoid complex medical jargon. Explain things in plain language (approx. 8th-grade reading level) so anyone can understand. Use Markdown for readability.

Your goal is to bridge the gap between uncertainty and professional care.
`;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert Data URL to inlineData Part
const imageToPart = (dataUrl: string): Part => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length < 3) {
    throw new Error("Invalid image data");
  }
  return {
    inlineData: {
      mimeType: matches[1],
      data: matches[2]
    }
  };
};

export const sendMessageToGemini = async (
  history: Message[],
  userMessage: string,
  location?: GeolocationCoordinates,
  image?: string // Base64 Data URL
): Promise<{ text: string; groundingMetadata?: any }> => {
  try {
    // Format history for the API
    const contents: Content[] = history.map((msg) => {
      const parts: Part[] = [];
      // If history message had an image, include it for context
      if (msg.image) {
        try {
          parts.push(imageToPart(msg.image));
        } catch (e) {
          console.warn("Failed to process history image", e);
        }
      }
      parts.push({ text: msg.content } as Part);
      
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: parts,
      };
    });

    // Construct current user message parts
    const currentParts: Part[] = [];
    
    // Add Image first if present (often gives better context for the text prompt)
    if (image) {
      currentParts.push(imageToPart(image));
    }
    
    // Add Text
    currentParts.push({ text: userMessage } as Part);

    // Add the new user message to contents
    contents.push({
      role: 'user',
      parts: currentParts,
    });

    // Switched to gemini-2.5-flash for reliable Google Maps tool support and Multimodal inputs
    const modelId = 'gemini-2.5-flash';

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

    const response: GenerateContentResponse = await ai.models.generateContent({
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

    // Check for safety blocks
    if (response.promptFeedback?.blockReason) {
      throw new Error(`Content blocked for safety: ${response.promptFeedback.blockReason}`);
    }

    // Access text directly via the SDK property
    const text = response.text;
    
    if (!text) {
      // Check if it was a safety finish reason if no text is present
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
         throw new Error("The AI response was flagged for safety concerns and cannot be displayed.");
      }
      throw new Error("The model returned an empty response.");
    }

    // Extract grounding metadata from the first candidate
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return { text, groundingMetadata };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMessage = "I apologize, but I'm having trouble connecting right now.";
    
    if (error.message.includes("SAFETY") || error.message.includes("blocked")) {
        errorMessage = "I cannot fulfill this request due to safety guidelines. Please ensure your query does not violate our policies regarding dangerous or harmful content.";
    } else if (error.message.includes("429")) {
        errorMessage = "I am receiving too many requests at the moment. Please try again in a few seconds.";
    } else if (error.message.includes("Google Maps tool is not enabled")) {
        errorMessage = "Configuration Error: The map tool is currently unavailable for this model version.";
    }

    throw new Error(errorMessage);
  }
};