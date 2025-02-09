import { useState, useEffect } from "react"
import { useSpeechRecognition } from "../hooks/useSpeechRecognition"
import { extractCPTCodes } from "../hooks/extractCPTCodes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Search } from "lucide-react"
import { CPTCodeCard } from "./CPTCodeCard"
import { CollapsibleSidebar } from "./CollapsibleSidebar"
import { useToast } from "@/hooks/use-toast"


export function CPTRecorder() {
  const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition()
  const [cptCodes, setCPTCodes] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (!isListening && transcript) {
      const codes = extractCPTCodes(transcript)
      setCPTCodes(codes)
    }
  }, [isListening, transcript])

  const filteredCodes = cptCodes.filter((code) => code.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "CPT Code Copied",
      description: `${code} has been copied to your clipboard.`,
    })
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full gap-4">
      <div className="flex-grow space-y-4 overflow-auto p-4 h-full">
        <h1 className="text-3xl font-bold text-primary">CPT Code Recorder</h1>
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recording Controls
              {isListening && <span className="text-sm font-normal text-destructive animate-pulse">Recording...</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              className="w-full"
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" /> Start Recording
                </>
              )}
            </Button>
            {error && <p className="text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Extracted CPT Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search CPT codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            {filteredCodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCodes.map((code, index) => (
                  <CPTCodeCard key={index} code={code} onCopy={handleCopy} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {cptCodes.length > 0
                  ? "No matching CPT codes found."
                  : "No CPT codes extracted yet. Start recording to extract codes."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <CollapsibleSidebar transcript={transcript} />
    </div>
  )
}

