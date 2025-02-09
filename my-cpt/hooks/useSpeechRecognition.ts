import { useState, useEffect, useCallback } from "react";
import Voice, { 
  SpeechResultsEvent,
  SpeechErrorEvent 
} from '@react-native-voice/voice';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value) {
        setTranscript((prev) => prev + " " + e.value[0]);
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setError(`Error: ${e.error?.message}`);
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = useCallback(async () => {
    try {
      await Voice.start('en-US');
      setIsListening(true);
      setError(null);
    } catch (e) {
      setError('Error starting voice recognition');
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      setError('Error stopping voice recognition');
    }
  }, []);

  return { isListening, transcript, error, startListening, stopListening };
} 