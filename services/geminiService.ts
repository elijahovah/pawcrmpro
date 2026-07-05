import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Ensure API_KEY is available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyBreed = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Identify the dog breed in this image. Provide the breed name, 3 key personality traits, and a brief grooming tip. Format it clearly with **bold** headers and bullet points."
          }
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
        parts: [
          {
            text: `You are an expert data entry AI. 
            Analyze the following raw text data from pet grooming intake cards. 
            Extract each client+pet profile and return a valid JSON array.
            
            RAW DATA:
            ${fileContent}
            
            Rules:
            - Use empty strings for missing text fields.
            - Use false for unknown checkbox booleans.
            - Do not add markdown or commentary.
            - Strictly follow the schema.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ownerFirstName: { type: Type.STRING },
              ownerLastName: { type: Type.STRING },
              clientName: { type: Type.STRING },
              address: { type: Type.STRING },
              phoneNumber: { type: Type.STRING },
              homePhone: { type: Type.STRING },
              cellPhone: { type: Type.STRING },
              email: { type: Type.STRING },
              petName: { type: Type.STRING },
              petBreed: { type: Type.STRING },
              petSex: { type: Type.STRING },
              petAge: { type: Type.STRING },
              petWeight: { type: Type.STRING },
              petColor: { type: Type.STRING },
              allergies: { type: Type.STRING },
              spayedNeutered: { type: Type.BOOLEAN },
              vaccinationsCurrent: { type: Type.BOOLEAN },
              vetInfo: { type: Type.STRING },
              medicalIssues: { type: Type.STRING },
              temperament: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              groomingNotes: { type: Type.STRING },
              referralSource: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["clientName", "petName"]
          },
        },
      }
    });
    return response.text || "[]";
  } catch (error) {
    console.error("Batch Intake Error:", error);
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process file with AI: ${detail}`);
  }
};

export const processBatchIntakeImage = async (base64Image: string, mimeType: string): Promise<string> => {
    try {
      // Ensure we always have a valid image mime type for the API
      const validMimeType = (mimeType && mimeType.startsWith('image/')) ? mimeType : 'image/jpeg';

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
              parts: [
                  {
                      inlineData: {
                          mimeType: validMimeType,
                          data: base64Image
                      }
                  },
                  {
                      text: `Perform OCR on this handwritten pet grooming intake card and extract all legible profile fields.
                      Return ONLY a JSON array of objects using this exact schema:
                      - ownerFirstName (string)
                      - ownerLastName (string)
                      - clientName (string, combine owner names if needed)
                      - address (string)
                      - phoneNumber (string, best primary)
                      - homePhone (string)
                      - cellPhone (string)
                      - email (string)
                      - petName (string)
                      - petBreed (string)
                      - petSex (string, e.g. M/F/Male/Female)
                      - petAge (string)
                      - petWeight (string)
                      - petColor (string)
                      - allergies (string)
                      - spayedNeutered (boolean)
                      - vaccinationsCurrent (boolean)
                      - vetInfo (string)
                      - medicalIssues (string)
                      - temperament (string[] from checkboxes like Easy/Fair/Difficult/Shy/Hyper/Noisy/Blind/Deaf/Diabetic/Other)
                      - groomingNotes (string)
                      - referralSource (string from location/social media/referral/other)
                      - notes (string, concise summary)

                      Rules:
                      - Use empty strings for unknown text.
                      - Use false for unknown booleans.
                      - Do not return markdown, explanations, or extra keys.`
                  }
              ]
          },
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      ownerFirstName: { type: Type.STRING },
                      ownerLastName: { type: Type.STRING },
                      clientName: { type: Type.STRING },
                      address: { type: Type.STRING },
                      phoneNumber: { type: Type.STRING },
                      homePhone: { type: Type.STRING },
                      cellPhone: { type: Type.STRING },
                      email: { type: Type.STRING },
                      petName: { type: Type.STRING },
                      petBreed: { type: Type.STRING },
                      petSex: { type: Type.STRING },
                      petAge: { type: Type.STRING },
                      petWeight: { type: Type.STRING },
                      petColor: { type: Type.STRING },
                      allergies: { type: Type.STRING },
                      spayedNeutered: { type: Type.BOOLEAN },
                      vaccinationsCurrent: { type: Type.BOOLEAN },
                      vetInfo: { type: Type.STRING },
                      medicalIssues: { type: Type.STRING },
                      temperament: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      groomingNotes: { type: Type.STRING },
                      referralSource: { type: Type.STRING },
                      notes: { type: Type.STRING }
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
        systemInstruction: "You are a helpful, expert assistant for a professional pet groomer using PawCRM. You help with scheduling advice, grooming tips, business management, and customer service drafts."
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now. Please check your internet connection and try again.";
  }
};

export const generateMarketingCopy = async (topic: string, type: 'Email' | 'SMS', audience: string): Promise<{subject: string, content: string}> => {
  try {
    const prompt = `Act as an expert copywriter for a professional pet grooming business.
    Write a ${type} marketing message.
    
    Context:
    - Topic: ${topic}
    - Target Audience: ${audience}
    
    Requirements:
    - Tone: Professional, warm, and engaging.
    ${type === 'SMS' 
        ? '- Strict limit: under 160 characters.\n- No subject line.\n- Clear, direct, and urgent.' 
        : '- Subject Line: Generate a highly compelling, click-worthy subject line (max 60 chars) designed to maximize open rates for this specific audience.\n- Body: Engaging and persuasive with a clear call to action.'}
    
    Return JSON format: { "subject": "string", "content": "string" }`;

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

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Marketing Gen Error:", error);
    return { subject: "", content: "Error generating draft." };
  }
};

export const generateAppointmentReminder = async (
  clientName: string,
  petName: string,
  service: string,
  appointmentTime: string,
  type: 'Email' | 'SMS',
  cancellationPolicy: string = '24 hours notice'
): Promise<{subject: string, content: string}> => {
  try {
    const prompt = `Write a ${type} appointment reminder for a pet grooming business.
    Details:
    - Client Name: ${clientName}
    - Pet Name: ${petName}
    - Service: ${service}
    - Appointment Time: ${appointmentTime}
    
    Requirements:
    - Tone: Friendly, professional, and clear.
    - ${type === 'SMS' ? 'Keep it under 160 characters. No subject line needed.' : 'Include a clear subject line.'}
    - Mention that they should arrive 5 minutes early.
    - Mention our cancellation policy: "${cancellationPolicy}".
    
    Return JSON format: { "subject": "string", "content": "string" }`;

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

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Reminder Gen Error:", error);
    return { subject: "", content: "Error generating reminder." };
  }
};

export const generateClientFollowUp = async (
  clientName: string,
  petName: string,
  lastVisit: string,
  type: 'Email' | 'SMS'
): Promise<{ subject: string, content: string }> => {
  try {
    const prompt = `Act as a professional pet groomer. Write a ${type} follow-up message for a client.
    
    Context:
    - Client Name: ${clientName}
    - Pet Name: ${petName}
    - Last Grooming Visit: ${lastVisit}
    
    Objectives:
    1. Ask how ${petName} is doing after their groom on ${lastVisit}.
    2. Mention that regular grooming keeps the coat healthy.
    3. Invite them to book their next session soon.
    
    Tone: Friendly, caring, appreciative.
    
    Constraints:
    ${type === 'SMS' 
      ? '- Max 160 characters.\n- No subject line.\n- Casual but professional.' 
      : '- Subject Line: Warm and engaging (max 50 chars).\n- Body: 3-4 sentences.'}
    
    Return JSON format: { "subject": "string", "content": "string" }`;

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

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("FollowUp Gen Error:", error);
    return { subject: "", content: "Error generating follow-up." };
  }
};

export const analyzeBreederText = async (text: string): Promise<{ riskLevel: string, summary: string, redFlags: string[], questionsToAsk: string[] }> => {
  try {
    const prompt = `Analyze the following text (which could be an email, website copy, or advertisement) from a dog breeder.
    Identify potential "Red Flags" that might indicate a puppy mill, backyard breeder, or scam.
    
    Text to analyze:
    "${text}"
    
    Look for:
    - Urgency ("Buy now or lose it")
    - Accepting only crypto/Zelle/Cash App
    - Refusal of video calls or on-site visits
    - Sending puppies before 8 weeks
    - "Rare" or "Exotic" colors/sizes (teacup, merle in breeds that don't have it)
    - No mention of health testing (OFA/PennHIP)
    
    Return JSON format:
    {
      "riskLevel": "High" | "Medium" | "Low",
      "summary": "A 2-sentence assessment of the text.",
      "redFlags": ["List of specific concerning phrases or policies found"],
      "questionsToAsk": ["3 specific, hard-hitting questions the user should ask this breeder to verify legitimacy"]
    }`;

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

    const outputText = response.text || "{}";
    return JSON.parse(outputText);
  } catch (error) {
    console.error("Breeder Analysis Error:", error);
    return {
      riskLevel: "Unknown",
      summary: "Could not analyze text.",
      redFlags: ["Analysis Failed"],
      questionsToAsk: ["Ask for OFA health certificates", "Ask for a video call"]
    };
  }
};
