
import { GoogleGenAI, Modality } from "@google/genai";

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is a data URL (e.g., "data:image/jpeg;base64,L...")
      // We only need the base64 part
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const editImage = async (
  imageFile: File,
  maskDataUrl: string,
  prompt: string
): Promise<string> => {
  try {
    const imageBase64 = await fileToBase64(imageFile);
    const maskBase64 = maskDataUrl.split(',')[1];

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: imageFile.type,
      },
    };

    const maskPart = {
      inlineData: {
        data: maskBase64,
        mimeType: 'image/png',
      },
    };

    const textPart = {
      text: prompt,
    };
    
    // NOTE: We are assuming the 'gemini-2.5-flash-image' model can interpret
    // a three-part prompt (image, mask, text) for inpainting tasks.
    // This is a common pattern for such models.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, maskPart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    // Find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error('No image found in the Gemini API response.');

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the Gemini API.');
  }
};
