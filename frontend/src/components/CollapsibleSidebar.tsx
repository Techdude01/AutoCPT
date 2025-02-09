import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleSidebarProps {
  transcript: string
}

export function CollapsibleSidebar({ transcript }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="relative h-full ml-auto">
      <Card
        className={cn(
          "absolute right-0 h-full overflow-hidden flex flex-col transition-all duration-300",
          "bg-slate-800/50 backdrop-blur-sm border border-slate-700",
          "shadow-lg hover:shadow-cyan-500/10",
          isCollapsed ? "w-16" : "w-80",
        )}
      >
        <CardHeader className="flex-shrink-0 flex flex-row items-center p-4 border-b border-slate-700">
          {!isCollapsed ? (
            <>
              <CardTitle className="text-lg flex-grow whitespace-nowrap overflow-hidden bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Full Transcription
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigator.clipboard.writeText(transcript)}
                title="Copy to clipboard"
                className="mr-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 transition-all duration-300"
              >
                <Clipboard className="h-4 w-4 text-white" />
              </Button>
            </>
          ) : (
            <div className="flex-grow" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 transition-all duration-300"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4 text-white" /> : <ChevronLeft className="h-4 w-4 text-white" />}
          </Button>
        </CardHeader>
        {!isCollapsed && (
          <CardContent className="flex-grow overflow-auto p-4">
            <p className="whitespace-pre-wrap text-slate-300">{transcript}</p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

