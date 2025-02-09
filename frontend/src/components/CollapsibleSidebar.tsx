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
    <Card
      className={cn(
        "h-full overflow-hidden flex flex-col transition-all duration-300 bg-card text-card-foreground",
        isCollapsed ? "w-12" : "w-80",
      )}
    >
      <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between p-4">
        {!isCollapsed && (
          <>
            <CardTitle className="text-lg">Full Transcription</CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigator.clipboard.writeText(transcript)}
              title="Copy to clipboard"
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="flex-grow overflow-auto p-4">
          <p className="whitespace-pre-wrap text-foreground">{transcript}</p>
        </CardContent>
      )}
    </Card>
  )
}

