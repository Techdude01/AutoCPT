import { useState, useEffect, useCallback } from "react";
import Voice, { 
  SpeechResultsEvent,
  SpeechErrorEvent 
} from '@react-native-voice/voice';
import axios, { AxiosError } from "axios";

interface CPTCode {
  code: string;
  description: string;
}

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not defined in environment variables');
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cptCodes, setCptCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleSpeechResults = (e: SpeechResultsEvent) => {
      if (!e.value || e.value.length === 0) return;
      
      const text = e.value[e.value.length - 1].trim();
      setTranscript(text);
    };

    const handleSpeechError = (e: SpeechErrorEvent) => {
      setError(`Speech Recognition Error: ${e.error?.message || "Unknown error occurred"}`);
      setIsListening(false);
    };

    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechError = handleSpeechError;

    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setTranscript("");
      await Voice.start('en-US');
      setIsListening(true);
    } catch (e) {
      const error = e as Error;
      setError(`Failed to start voice recognition: ${error.message}`);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      if (transcript.trim()) {
        await fetchCPTCodes(transcript);
      }
    } catch (e) {
      const error = e as Error;
      setError(`Failed to stop voice recognition: ${error.message}`);
    }
  }, [transcript]);

  const parseCPTCodes = (responseText: string): Record<string, string> => {
    console.log("🟠 Parsing CPT Codes from:", responseText);
    const codePattern = /CODE:\s*(\d+)[^\n]*\nDESCRIPTION:\s*([^\n]+)/g;
    const matches = [...responseText.matchAll(codePattern)];
  
    if (!matches.length) {
      console.warn("⚠️ No CPT codes detected in response.");
      return {};
    }
  
    return matches.reduce((acc, match) => {
      const [_, code, description] = match;
      if (code && description) {
        acc[code.trim()] = description.trim();
      }
      return acc;
    }, {} as Record<string, string>);
  };

  const fetchCPTCodes = async (text: string) => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
      }

      console.log('Sending request to Groq API with text:', text);

      const response = await axios.post<GroqResponse>(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          messages: [
            {
              role: "system",
              content: `You are a medical coding assistant. For each relevant procedure mentioned, output exactly in this format (and only this format):
    CODE: [5-digit-number]
    DESCRIPTION: [procedure description]
    
    Limit to 3-5 most relevant codes. Do not include any other text or explanations.`
            },
            {
              role: "user",
              content: text
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.1,
          max_tokens: 1024,
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Groq API response:', response.data);

      const responseText = response.data.choices?.[0]?.message?.content;
      
      if (!responseText) {
        throw new Error("No response content from Groq API");
      }

      const extractedCodes = parseCPTCodes(responseText);
      console.log('Extracted CPT codes:', extractedCodes);
      
      if (Object.keys(extractedCodes).length === 0) {
        setError("No CPT codes found in the response");
      } else {
        setCptCodes(extractedCodes);
      }

    } catch (err) {
      const error = err as Error | AxiosError;
      if (axios.isAxiosError(error)) {
        console.error("Groq API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        setError(`Failed to fetch CPT codes: ${error.response?.data?.error?.message || error.message}`);
      } else {
        console.error("Error fetching CPT codes:", error);
        setError(`Failed to fetch CPT codes: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    isListening,
    transcript,
    cptCodes,
    loading,
    error,
    startListening,
    stopListening
  };
}