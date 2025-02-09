import { useState, useEffect, useCallback } from "react"

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [cptHistory, setCptHistory] = useState<Array<Record<string, string>>>([])

  const startListening = useCallback(() => {
    setIsListening(true)
    setError(null)
    setTranscript("")
  }, [])

  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:5001/ws')
    
    ws.onopen = () => {
      console.log('Connected to WebSocket server')
    }

    ws.onerror = (error) => {
      setError('WebSocket connection error')
      console.error('WebSocket error:', error)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.cpt_history) {
          setCptHistory(data.cpt_history)
        }
        if (data.error) {
          setError(data.error)
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e)
      }
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
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
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        }
      }

      // Only update and send if we have a final transcript
      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ text: finalTranscript }));
        }
      }
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
  }, [isListening, socket])

  return { isListening, transcript, error, startListening, stopListening, cptHistory}
}
