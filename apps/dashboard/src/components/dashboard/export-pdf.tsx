'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { DownloadIcon, FileText, Loader2 } from 'lucide-react'

interface CallData {
  id: string
  client_id: string
  prospect_name?: string
  heatcheck_score?: number
  top_need_pain_point?: string
  main_objection?: string
  call_outcome?: string
  date_created: string
}

interface Client {
  business_name: string
  industry: string
}

interface ExportPDFProps {
  calls: CallData[]
  client: Client | null
  timeframe: string
  totalCalls: number
  averageHeatCheck: number
  conversionRate: number
  topNeeds: string[]
  topObjections: string[]
}

export function ExportPDF({
  calls,
  client,
  timeframe,
  totalCalls,
  averageHeatCheck,
  conversionRate,
  topNeeds,
  topObjections
}: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportComplete, setExportComplete] = useState(false)

  const generatePDF = async () => {
    setIsExporting(true)
    setProgress(0)
    setExportComplete(false)

    try {
      // Simulate PDF generation progress
      const steps = [
        { step: 'Preparing data...', progress: 20 },
        { step: 'Generating report sections...', progress: 40 },
        { step: 'Creating performance charts...', progress: 60 },
        { step: 'Formatting tables...', progress: 80 },
        { step: 'Finalizing PDF...', progress: 100 }
      ]

      for (const { step, progress } of steps) {
        setProgress(progress)
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate processing time
      }

      // Generate PDF content (this will be implemented with @react-pdf/renderer in Phase 3)
      const pdfContent = generatePDFContent()
      
      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${timeframe}-sales-call-analysis-report-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportComplete(true)
      
      // Auto-close after success
      setTimeout(() => {
        setIsExporting(false)
        setExportComplete(false)
      }, 2000)

    } catch (error) {
      console.error('PDF generation failed:', error)
      setIsExporting(false)
    }
  }

  const generatePDFContent = () => {
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const reportTitle = timeframe === 'daily' ? 'Daily Sales Call Analysis Report' : 'Weekly Sales Call Analysis Report'

    return `
${reportTitle}
${client?.business_name || 'Sales Dashboard'}
Ending Date: ${reportDate}

===============================================
1. ${timeframe === 'daily' ? 'Daily' : 'Weekly'} Performance Metrics
===============================================

• Total number of calls analyzed: ${totalCalls}
• Average HeatCheck score: ${averageHeatCheck}
• Conversion rate: ${conversionRate}%

• Top 3 most common prospect needs/pain points:
${topNeeds.map((need, index) => `  ${index + 1}. ${need}`).join('\n')}

• Top 3 most frequent objections:
${topObjections.map((objection, index) => `  ${index + 1}. ${objection}`).join('\n')}

===============================================
2. Top Performing Calls
===============================================

${calls
  .filter(call => (call.heatcheck_score || 0) >= 6)
  .slice(0, 3)
  .map(call => `• Call with ${call.prospect_name} - HeatCheck Score: ${call.heatcheck_score}
  ${call.call_outcome?.substring(0, 150)}...`)
  .join('\n\n')}

===============================================
3. Detailed Call Breakdown
===============================================

${'Date & Time'.padEnd(20)} | ${'Prospect Name'.padEnd(20)} | ${'HeatCheck'.padEnd(10)} | ${'Top Need/Pain Point'.padEnd(30)} | ${'Main Objection'.padEnd(25)} | Call Outcome
${'-'.repeat(140)}
${calls.slice(0, 20).map(call => {
  const date = new Date(call.date_created).toLocaleDateString()
  const prospect = (call.prospect_name || 'Unknown').substring(0, 18)
  const heatcheck = call.heatcheck_score?.toString() || 'N/A'
  const need = (call.top_need_pain_point || 'Not specified').substring(0, 28)
  const objection = (call.main_objection || 'None').substring(0, 23)
  const outcome = (call.call_outcome || 'Not specified').substring(0, 25)
  
  return `${date.padEnd(20)} | ${prospect.padEnd(20)} | ${heatcheck.padEnd(10)} | ${need.padEnd(30)} | ${objection.padEnd(25)} | ${outcome}`
}).join('\n')}

===============================================
4. Team Performance Summary
===============================================

Team performance metrics will be available in Phase 3 with real team data integration.

===============================================
Report generated on: ${new Date().toLocaleString()}
Generated by: Sales Call Analysis Dashboard v2.0
===============================================
`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Sales Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isExporting && !exportComplete && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Generate a PDF report matching your existing {timeframe} sales call analysis format.
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Report Contents:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Performance metrics and conversion rates</li>
                  <li>• Top performing calls with success factors</li>
                  <li>• Detailed call breakdown table</li>
                  <li>• Team performance summary</li>
                </ul>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Format: PDF • Data: {totalCalls} calls
                </div>
                <Button onClick={generatePDF} className="flex items-center gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  Generate PDF
                </Button>
              </div>
            </div>
          )}
          
          {isExporting && !exportComplete && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Generating your report...</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                This may take a few moments for large datasets
              </div>
            </div>
          )}
          
          {exportComplete && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <DownloadIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Export Complete!</h4>
                <p className="text-sm text-green-700">Your report has been downloaded successfully.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 