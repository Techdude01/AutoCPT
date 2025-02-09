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
  const [cptCodes, setCPTCodes] = useState<string[]>([])
  const { isListening, transcript, error, startListening, stopListening, cptHistory } = useSpeechRecognition()
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // useEffect(() => {
  //   if (!isListening && transcript) {
  //     const codes = []
  //     console.log(cptHistory)
  //     for (const codeObj of cptHistory) {
  //       const [code, description] = Object.entries(codeObj)[0]
  //       codes.push(`${code} - ${description}`)
  //     }
  //     setCPTCodes(codes)
  //   }
  // }, [isListening, transcript])

  useEffect(() => {
    if (cptHistory) {
      const codes = []
      console.log(cptHistory)
      for (const codeObj of cptHistory) {
        const [code, description] = Object.entries(codeObj)[0]
        codes.push(`${code} - ${description}`)
      }
      console.log(codes)
      setCPTCodes(codes)
    }
  }, [cptHistory])

  const filteredCodes = cptCodes.filter((code) => code.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "CPT Code Copied",
      description: `${code} has been copied to your clipboard.`,
    })
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen gap-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="flex-grow space-y-4 overflow-auto p-4 h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/50 [&::-webkit-scrollbar-thumb]:bg-cyan-500/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-cyan-500/80">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">CPT Code Recorder</h1>
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-100">
              Recording Controls
              {isListening && <span className="text-sm font-normal text-cyan-400 animate-pulse">Recording...</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              className={`w-full transition-all duration-300 ${
                isListening 
                  ? "bg-rose-500 hover:bg-rose-600" 
                  : "bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600"
              }`}
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
            {error && <p className="text-rose-400 mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-100">Extracted CPT Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search CPT codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
                icon={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>
            {filteredCodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCodes.map((code, index) => (
                  <CPTCodeCard key={index} code={code} onCopy={handleCopy} />
                ))}
              </div>
            ) : (
              <p className="text-slate-400">
                {cptCodes.length > 0
                  ? "No matching CPT codes found."
                  : "No CPT codes extracted yet. Start recording to extract codes."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="w-1/3">
        <CollapsibleSidebar transcript={transcript} />
      </div>
    </div>
  )
}

