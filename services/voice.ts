import { GeminiService } from "./gemini";
import { Language } from "./i18n";

// Using Gemini for Intent Classification
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface VoiceCommand {
  action: 'NAVIGATE' | 'SEARCH' | 'CREATE_NOTE' | 'UNKNOWN' | 'SWITCH_MODULE';
  payload: any;
}

export class VoiceService {
  private recognition: any;
  private isListening: boolean = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private stream: MediaStream | null = null;

  constructor(
    private lang: Language,
    private onResult: (text: string, isFinal: boolean) => void,
    private onError: (err: string) => void
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.onError("Browser does not support Speech API");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.updateLang(lang);

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) this.onResult(final, true);
      else if (interim) this.onResult(interim, false);
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech Error", event.error);
      if (event.error === 'not-allowed') {
        this.onError("Microphone permission denied.");
      }
    };
  }

  public updateLang(lang: Language) {
    if (!this.recognition) return;
    this.lang = lang;
    this.recognition.lang = lang === 'de' ? 'de-DE' : lang === 'fa' ? 'fa-IR' : 'en-US';
  }

  public async start() {
    if (this.isListening) return;
    try {
      this.recognition.start();
      this.isListening = true;
      await this.initVisualizer();
    } catch (e) {
      console.error(e);
    }
  }

  public stop() {
    if (!this.isListening) return;
    if (this.recognition) this.recognition.stop();
    this.stopVisualizer();
    this.isListening = false;
  }

  // --- AUDIO VISUALIZER ---

  private async initVisualizer() {
    try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        source.connect(this.analyser);
        this.analyser.fftSize = 256;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
    } catch (e) {
        console.warn("Visualizer init failed", e);
    }
  }

  private stopVisualizer() {
      if (this.stream) {
          this.stream.getTracks().forEach(t => t.stop());
          this.stream = null;
      }
      if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
      }
  }

  public getAudioData(): Uint8Array | null {
      if (this.analyser && this.dataArray) {
          this.analyser.getByteFrequencyData(this.dataArray);
          return this.dataArray;
      }
      return null;
  }

  // --- INTENT PARSING ---

  static async parseIntent(text: string, lang: Language): Promise<VoiceCommand> {
      try {
          // Gemini Call for Intent Understanding
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `
              You are the core logic engine of ParSam OS.
              Analyze the user's voice command and map it to a JSON action.
              Language: ${lang}
              
              Available Actions:
              1. NAVIGATE: user wants to go to a section (Notes, Settings, Archive, Favorites, Trash). payload: { view: string }
              2. SWITCH_MODULE: user wants to switch app (Logo Maker, Notes, Voice). payload: { module: 'notes'|'logos'|'voice' }
              3. SEARCH: user wants to find something. payload: { query: string }
              4. CREATE_NOTE: user wants to create a note. payload: { content: string, title?: string }
              
              If unclear, return { "action": "UNKNOWN", "payload": {} }
              
              User Command: "${text}"
              
              Return ONLY raw JSON. No markdown formatting.
              `
          });

          const rawText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
          return JSON.parse(rawText) as VoiceCommand;

      } catch (e) {
          console.error("Intent Parsing Failed", e);
          return { action: 'UNKNOWN', payload: {} };
      }
  }
}
