import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CPTCodeCardProps {
  code: string
  onCopy: (code: string) => void
}

export function CPTCodeCard({ code, onCopy }: CPTCodeCardProps) {
  const [codeNumber, description] = code.split(" - ")

  return (
    <Card className="hover:shadow-cyan-500/10 transition-all duration-300 bg-blue-950/50 backdrop-blur-sm border border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-100">{codeNumber}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onCopy(code)}
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 transition-all duration-300"
              >
                <Clipboard className="h-4 w-4 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy CPT code</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-slate-300">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

