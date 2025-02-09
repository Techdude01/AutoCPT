import { useState, useEffect, useCallback } from "react"

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const startListening = useCallback(() => {
    setIsListening(true)
    setError(null)
    setTranscript("")
  }, [])

  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      setTranscript((prev) => prev + transcript + " ")
    }

    recognition.onerror = (event: SpeechRecognitionEvent) => {
      setError("Error occurred in recognition: " + event.error)
    }

    if (isListening) {
      recognition.start()
    } else {
      recognition.stop()
    }

    return () => {
      recognition.stop()
    }
  }, [isListening])

  return { isListening, transcript, error, startListening, stopListening }
}

