import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeParse = (text: string, fallback: any) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return fallback;
  }
};

export const identifyBreed = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Identify the dog breed in this image. Provide the breed name, 3 key personality traits, and a brief grooming tip. Format it clearly with **bold** headers and bullet points." }
        ]
      }
    });
    return response.text || "Could not identify the breed.";
  } catch (error) {
    console.error("Breed ID Error:", error);
    return "Error identifying breed. Please try again.";
  }
};

export const processBatchIntake = async (fileContent: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: `You are an expert data entry AI. Analyze the following raw text data which represents a list of clients and their pets. Extract the data and format it into a valid JSON array. RAW DATA: ${fileContent} Strictly follow the schema.` }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              clientName: { type: Type.STRING },
              phoneNumber: { type: Type.STRING },
              petName: { type: Type.STRING },
              petBreed: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
            required: ["clientName", "petName"]
          },
        },
      }
    });
    return response.text || "[]";
  } catch (error) {
    console.error("Batch Intake Error:", error);
    throw new Error("Failed to process file with AI.");
  }
};

export const processBatchIntakeImage = async (base64Image: string, mimeType: string): Promise<string> => {
    try {
      const validMimeType = (mimeType && mimeType.startsWith('image/')) ? mimeType : 'image/jpeg';
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
              parts: [
                  { inlineData: { mimeType: validMimeType, data: base64Image } },
                  { text: `Perform OCR on this handwritten client intake document or business card. Extract all legible client and pet information. Return a JSON array.` }
              ]
          },
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      clientName: { type: Type.STRING },
                      phoneNumber: { type: Type.STRING },
                      petName: { type: Type.STRING },
                      petBreed: { type: Type.STRING },
                      notes: { type: Type.STRING },
                    },
                  },
              },
          }
      });
      return response.text || "[]";
    } catch (error) {
        console.error("Batch Image Intake Error:", error);
        throw error;
    }
}

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: "You are a helpful, expert assistant for a professional pet groomer using PawCRM."
      }
    });
    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now.";
  }
};

export const generateMarketingCopy = async (topic: string, type: 'Email' | 'SMS', audience: string): Promise<{subject: string, content: string}> => {
  try {
    const prompt = `Act as an expert copywriter for a pet grooming business. Write a ${type} marketing message about "${topic}" for ${audience}. ${type === 'SMS' ? 'Under 160 chars.' : 'Include subject line.'} Return JSON.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING },
                content: { type: Type.STRING }
            }
        }
      }
    });
    return safeParse(response.text || "{}", { subject: "", content: "Error generating draft." });
  } catch (error) {
    return { subject: "", content: "Error generating draft." };
  }
};

export const generateAppointmentReminder = async (clientName: string, petName: string, service: string, appointmentTime: string, type: 'Email' | 'SMS', cancellationPolicy: string = '24 hours'): Promise<{subject: string, content: string}> => {
  try {
    const prompt = `Write a ${type} appointment reminder for ${clientName} and ${petName} for ${service} at ${appointmentTime}. Cancellation policy: ${cancellationPolicy}. Return JSON.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING },
                content: { type: Type.STRING }
            }
        }
      }
    });
    return safeParse(response.text || "{}", { subject: "", content: "Error generating reminder." });
  } catch (error) {
    return { subject: "", content: "Error generating reminder." };
  }
};

export const generateClientFollowUp = async (clientName: string, petName: string, lastVisit: string, type: 'Email' | 'SMS'): Promise<{ subject: string, content: string }> => {
  try {
    const prompt = `Write a ${type} follow-up for ${clientName} and ${petName} (last visit: ${lastVisit}). Ask how they are doing and invite back. Return JSON.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING },
                content: { type: Type.STRING }
            }
        }
      }
    });
    return safeParse(response.text || "{}", { subject: "", content: "Error generating follow-up." });
  } catch (error) {
    return { subject: "", content: "Error generating follow-up." };
  }
};

export const analyzeBreederText = async (text: string): Promise<{ riskLevel: string, summary: string, redFlags: string[], questionsToAsk: string[] }> => {
  try {
    const prompt = `Analyze this text for puppy scams or bad breeder red flags: "${text}". Return JSON.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                riskLevel: { type: Type.STRING },
                summary: { type: Type.STRING },
                redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                questionsToAsk: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        }
      }
    });
    return safeParse(response.text || "{}", { riskLevel: "Unknown", summary: "Error", redFlags: [], questionsToAsk: [] });
  } catch (error) {
    return { riskLevel: "Unknown", summary: "Analysis failed", redFlags: [], questionsToAsk: [] };
  }
};

export const generateBrandIdentity = async (businessName: string): Promise<{tagline: string}> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: `Create a tagline for grooming business "${businessName}". Return JSON {tagline}` }] },
      config: { responseMimeType: "application/json" }
    });
    return safeParse(response.text || "{}", { tagline: "Grooming with love." });
  } catch (e) {
    return { tagline: "Professional Pet Grooming" };
  }
}