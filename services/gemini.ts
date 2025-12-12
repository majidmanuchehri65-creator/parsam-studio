
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Note, Folder, Attachment, ChatSession, ChatMessage } from "../types";
import { StorageService } from "./storage";

const API_KEY = process.env.API_KEY || '';

// --- TOOL DEFINITIONS ---

const createNoteTool: FunctionDeclaration = {
    name: "create_note",
    description: "Create a new note in the user's notebook.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Title of the note" },
            content: { type: Type.STRING, description: "Content of the note" }
        },
        required: ["content"]
    }
};

const designBrandTool: FunctionDeclaration = {
    name: "design_brand",
    description: "Switch to Logo Maker and pre-fill design parameters for a brand logo.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            brandName: { type: Type.STRING },
            industry: { type: Type.STRING },
            style: { type: Type.STRING, description: "e.g. Minimalist, Vintage, Cyberpunk" }
        },
        required: ["brandName", "industry"]
    }
};

const searchContentTool: FunctionDeclaration = {
    name: "search_content",
    description: "Search for specific files or notes in the user's storage.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: { type: Type.STRING }
        },
        required: ["query"]
    }
};

export interface InspirationAnalysis {
    palette: string[];
    mood: string[];
    style: string;
    suggestions: string;
    shapeLanguage: string;
}

export class GeminiService {
  private static ai = new GoogleGenAI({ apiKey: API_KEY });

  // Helper to clean base64 string
  private static getBase64Data(dataUrl: string): string {
    return dataUrl.split(',')[1];
  }

  private static getMimeType(dataUrl: string): string {
    return dataUrl.split(';')[0].split(':')[1];
  }

  static async generateTitle(content: string): Promise<string> {
    if (!content.trim()) return "Untitled Note";
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a short, concise title (max 6 words) for the following note. Do not use quotes. \n\nNote Content:\n${content.substring(0, 1000)}`,
      });
      return response.text?.trim() || "Untitled Note";
    } catch (error) {
      console.error("Gemini Title Error:", error);
      return "Untitled Note";
    }
  }

  static async fixGrammar(text: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Fix the grammar and improve the flow of the following text (which may be HTML) without changing the meaning. Keep HTML tags intact if present or return plain text if provided plain. Return only the corrected text.\n\nText:\n${text}`,
      });
      return response.text?.trim() || text;
    } catch (error) {
      console.error("Gemini Grammar Error:", error);
      throw error;
    }
  }

  static async summarize(text: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following text in bullet points:\n\n${text}`,
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini Summary Error:", error);
      throw error;
    }
  }

  static async continueWriting(text: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Continue writing the following text naturally. Maintain the tone and style. Provide about 1 paragraph.\n\nText:\n${text}`,
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini Continue Error:", error);
      throw error;
    }
  }

  static async detectTasks(text: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following text and extract actionable tasks. Return them as a markdown checklist.\n\nText:\n${text}`,
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini Task Error:", error);
      throw error;
    }
  }

  static async extractContent(attachment: Attachment | {data: string}): Promise<string> {
    try {
        const base64Data = this.getBase64Data(attachment.data);
        const mimeType = this.getMimeType(attachment.data);
        
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: "Transcribe the text content from this document/image. Return ONLY the transcribed text. Do not add conversational filler." }
                ]
            }
        });
        return response.text || "";
    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        throw error;
    }
  }

  static async classifyFile(filename: string, mimeType: string, snippet?: string): Promise<{tags: string[], category: string}> {
    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this file and provide categorization metadata.
            Filename: ${filename}
            MimeType: ${mimeType}
            Content Snippet (if any): ${snippet || 'N/A'}
            
            Return JSON in this format:
            {
              "tags": ["tag1", "tag2", "tag3"],
              "category": "document" | "image" | "media" | "archive" | "financial" | "work" | "personal"
            }
            Do not include Markdown formatting in output.
            `
        });
        const txt = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
        const json = JSON.parse(txt);
        return {
            tags: json.tags || [],
            category: json.category || 'other'
        };
    } catch (e) {
        console.error("Classification Failed", e);
        return { tags: [], category: 'other' };
    }
  }

  static async autoOrganize(text: string, folders: Folder[]): Promise<string | null> {
    try {
      const folderList = folders.map(f => f.name).join(', ');
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the note content and pick the best matching folder from this list: [${folderList}]. Return ONLY the exact folder name. If none match well, return "None".\n\nContent:\n${text.substring(0, 500)}`,
      });
      const suggested = response.text?.trim();
      return folders.find(f => f.name === suggested)?.id || null;
    } catch (error) {
      console.error("Gemini Organize Error:", error);
      return null;
    }
  }

  static async chatWithNote(note: Note, message: string, history: {role: 'user' | 'model', text: string}[]): Promise<string> {
    try {
      // Build Smart Asset Context
      let attachmentContext = "";
      if (note.attachments.length > 0) {
          attachmentContext = "\n\nAttached Documents Content:\n";
          note.attachments.forEach(att => {
              if (att.extractedText) {
                  attachmentContext += `--- BEGIN ${att.fileName} ---\n${att.extractedText}\n--- END ${att.fileName} ---\n`;
              }
          });
      }

      const contextPrompt = `You are ParSam AI, an intelligent system architected for ParSam Studio.
      You are currently assisting with a note titled "${note.title}".
      
      Note Text Content:
      """
      ${note.contentPlain}
      """
      ${attachmentContext}
      
      The user may reference the text content or the attached documents above.
      Answer the user's questions based on this information. Be professional, concise, and helpful.`;

      const chat = this.ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: contextPrompt },
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        }))
      });

      const result = await chat.sendMessage({ message });
      return result.text || "I couldn't process that request.";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "I encountered an error connecting to ParSam AI.";
    }
  }

  // --- LOGO STUDIO ---

  static async analyzeInspiration(mediaItems: { mimeType: string, data: string }[]): Promise<InspirationAnalysis> {
      try {
          const prompt = `
          Analyze the visual elements in these images/video frames to create a Logo Design Inspiration Profile.
          
          Extract the following:
          1. Color Palette: 3-5 dominant hex codes.
          2. Mood: 3-4 keywords (e.g., Energetic, Corporate, Minimalist, Luxury).
          3. Shape Language: Describe the geometry (e.g., Round, Sharp, Organic).
          4. Style: Overall artistic style (e.g., Cyberpunk, Vintage, Flat).
          5. Suggestions: A concise sentence recommending how to translate this into a logo.

          Return JSON format:
          {
            "palette": ["#hex", ...],
            "mood": ["string", ...],
            "shapeLanguage": "string",
            "style": "string",
            "suggestions": "string"
          }
          Do not use markdown.
          `;

          const parts: any[] = mediaItems.map(item => ({
              inlineData: {
                  mimeType: item.mimeType,
                  data: this.getBase64Data(item.data)
              }
          }));
          parts.push({ text: prompt });

          const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts }
          });

          const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
          return JSON.parse(text) as InspirationAnalysis;

      } catch (e) {
          console.error("Inspiration Analysis Failed", e);
          throw new Error("Could not analyze visual content");
      }
  }

  static async generateLogo(brandName: string, slogan: string, industry: string, style: string, extra: string, inspiration?: InspirationAnalysis): Promise<{imageUrl: string, prompt: string}> {
      try {
          // 1. Optimize Prompt
          let inspirationContext = "";
          if (inspiration) {
              inspirationContext = `
              VISUAL INSPIRATION PROFILE:
              - Color Palette: ${inspiration.palette.join(', ')}
              - Mood: ${inspiration.mood.join(', ')}
              - Shape Language: ${inspiration.shapeLanguage}
              - Derived Style: ${inspiration.style}
              - Design Suggestions: ${inspiration.suggestions}
              
              INSTRUCTION: Ensure the logo strictly follows this inspiration profile while matching the brand name "${brandName}".
              `;
          }

          const optimizerPrompt = `Create a highly detailed image generation prompt for a professional logo.
          Brand Name: ${brandName}
          Slogan: ${slogan}
          Industry: ${industry}
          Desired Style: ${style}
          Additional Notes: ${extra}
          
          ${inspirationContext}
          
          The output should be a single paragraph describing the logo visually. 
          Focus on: Vector art style, flat design, clean lines, high contrast, white background, ${style} aesthetic. 
          Do not include text instructions like "generate this". Just the visual description.`;

          const optimizedResponse = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: optimizerPrompt
          });
          const visualPrompt = optimizedResponse.text || `${style} logo for ${brandName}, vector style, white background`;

          // 2. Generate Image
          const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [{ text: visualPrompt }]
              },
              config: {
                // @ts-ignore - Nano Banana Image generation config often differs slightly, respecting general guidance
              }
          });

          // 3. Extract Image
          for (const part of response.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                  return {
                      imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                      prompt: visualPrompt
                  };
              }
          }
          throw new Error("No image generated");

      } catch (e) {
          console.error("Logo Generation Error", e);
          throw e;
      }
  }

  // --- GLOBAL ASSISTANT ---

  static async chatGlobal(
      message: string, 
      sessionHistory: ChatMessage[],
      lang: 'en'|'de'|'fa'
  ): Promise<{ text: string, toolCalls?: {name: string, args: any, id: string}[] }> {
      
      // 1. Context Assembly (Simulated Retrieval)
      const recentNotes = StorageService.getNotes().slice(0, 5).map(n => `Note: ${n.title} (ID: ${n.id})\nSnippet: ${n.contentPlain.substring(0, 200)}...`).join('\n\n');
      const recentFiles = StorageService.getDriveFiles().slice(0, 5).map(f => `File: ${f.name} (Type: ${f.type}, Tags: ${f.tags.join(',')})`).join('\n');

      const systemPrompt = `You are ParSam ChatAI, the central intelligence of the ParSam Studio ecosystem.
      Your goal is to assist the user by answering questions, drafting content, and controlling the app.
      
      User Language Preference: ${lang}
      
      Context Awareness (Most Recent Items):
      ${recentNotes}
      ${recentFiles}
      
      Capabilities:
      - Answer questions about the user's notes and files.
      - Draft emails, stories, or code.
      - Perform actions using tools:
        - Create a new note if the user asks to save something.
        - Start a logo design if the user mentions branding.
        - Search for content.
      
      Safety Rules:
      - Do not output PII (emails, phone numbers) if detected in the source text, mask them.
      - Be concise and professional.
      `;

      const chat = this.ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { 
              systemInstruction: systemPrompt,
              tools: [{ functionDeclarations: [createNoteTool, designBrandTool, searchContentTool] }]
          },
          history: sessionHistory.map(m => ({
              role: m.role,
              parts: [{ text: m.text }]
          }))
      });

      try {
          const result = await chat.sendMessage({ message });
          
          // Check for tool calls
          const toolCalls = result.functionCalls?.map(fc => ({
              name: fc.name,
              args: fc.args,
              id: fc.id || crypto.randomUUID() // Fallback ID if missing
          }));

          return {
              text: result.text || "",
              toolCalls
          };

      } catch (e) {
          console.error("Global Chat Error", e);
          return { text: "I'm having trouble connecting to the neural network right now." };
      }
  }

  // --- SYSTEM DIAGNOSTICS ---
  static async diagnoseError(component: string, errorDetails: string): Promise<{ rootCause: string, recommendedFix: string }> {
      try {
          const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `You are the AI Site Reliability Engineer for ParSam Studio.
              Analyze the following system error and provide a root cause and a technical fix.
              
              Component: ${component}
              Error Logs: ${errorDetails}
              
              Return JSON:
              {
                  "rootCause": "Short explanation of why this happened",
                  "recommendedFix": "Technical action to resolve it (e.g., Restart Pod, Flush Cache, Rollback)"
              }
              Do not include markdown formatting.
              `
          });
          const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
          const json = JSON.parse(text);
          return {
              rootCause: json.rootCause || "Unknown system anomaly",
              recommendedFix: json.recommendedFix || "Restart service"
          };
      } catch (e) {
          return { rootCause: "AI Diagnostic Unreachable", recommendedFix: "Manual intervention required" };
      }
  }
}
