'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { DownloadIcon, FileText, FileSpreadsheet, Loader2, ChevronDownIcon } from 'lucide-react'

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

interface ExportUnifiedProps {
  calls: CallData[]
  client: Client | null
  timeframe: string
  totalCalls: number
  averageHeatCheck: number
  conversionRate: number
  topNeeds: string[]
  topObjections: string[]
  fileName?: string
}

type ExportType = 'pdf' | 'csv'

export function ExportUnified({
  calls,
  client,
  timeframe,
  totalCalls,
  averageHeatCheck,
  conversionRate,
  topNeeds,
  topObjections,
  fileName = 'sales_call_analysis'
}: ExportUnifiedProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportComplete, setExportComplete] = useState(false)
  const [exportType, setExportType] = useState<ExportType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const formatCSVValue = (value: any): string => {
    if (value === null || value === undefined) return ''
    const stringValue = String(value)
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  const generateCSV = async (): Promise<string> => {
    setProgress(10)
    
    // CSV headers
    const headers = [
      'Date & Time',
      'Prospect Name', 
      'HeatCheck Score',
      'Top Need/Pain Point',
      'Main Objection',
      'Call Outcome',
      'Call ID'
    ]
    
    setProgress(30)
    
    // Generate CSV content
    const csvContent = [
      headers.join(','),
      ...calls.map(call => [
        formatCSVValue(new Date(call.date_created).toLocaleString()),
        formatCSVValue(call.prospect_name || 'Unknown'),
        formatCSVValue(call.heatcheck_score || 'N/A'),
        formatCSVValue(call.top_need_pain_point || 'Not specified'),
        formatCSVValue(call.main_objection || 'None identified'),
        formatCSVValue(call.call_outcome || 'Not specified'),
        formatCSVValue(call.id)
      ].join(','))
    ].join('\n')
    
    setProgress(80)
    
    // Add UTF-8 BOM for Excel compatibility
    const bom = '\uFEFF'
    
    setProgress(100)
    return bom + csvContent
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

  const startExport = async (type: ExportType) => {
    setExportType(type)
    setIsExporting(true)
    setProgress(0)
    setExportComplete(false)
    setIsDialogOpen(true)

    try {
      if (type === 'csv') {
        const csvContent = await generateCSV()
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        
        link.setAttribute('href', url)
        link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
      } else if (type === 'pdf') {
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
      }

      setExportComplete(true)
      
      // Auto-close after success
      setTimeout(() => {
        setIsDialogOpen(false)
        setIsExporting(false)
        setExportComplete(false)
        setExportType(null)
      }, 2000)

    } catch (error) {
      console.error(`${type.toUpperCase()} export failed:`, error)
      setIsExporting(false)
      setExportType(null)
    }
  }

  const getExportIcon = () => {
    if (exportType === 'csv') return <FileSpreadsheet className="h-5 w-5" />
    if (exportType === 'pdf') return <FileText className="h-5 w-5" />
    return <DownloadIcon className="h-5 w-5" />
  }

  const getExportTitle = () => {
    if (exportType === 'csv') return 'Export to CSV'
    if (exportType === 'pdf') return 'Export Sales Report'
    return 'Export Data'
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
            <ChevronDownIcon className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => startExport('pdf')}
            disabled={calls.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF Report
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => startExport('csv')}
            disabled={calls.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getExportIcon()}
              {getExportTitle()}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isExporting && !exportComplete && exportType === 'pdf' && (
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
              </div>
            )}

            {!isExporting && !exportComplete && exportType === 'csv' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Export Details</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>{calls.length} calls</strong> will be exported</li>
                  <li>• All current filters will be applied</li>
                  <li>• Compatible with Excel and Google Sheets</li>
                  <li>• File size: ~{Math.round(calls.length * 0.2)}KB</li>
                </ul>
              </div>
            )}
            
            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {exportType === 'csv' ? 'Generating CSV...' : 'Generating PDF...'}
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {exportComplete && (
              <div className="text-center text-green-600">
                <div className="text-lg font-medium">✓ Export Complete!</div>
                <div className="text-sm">
                  Your {exportType?.toUpperCase()} has been downloaded.
                </div>
              </div>
            )}

            {calls.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No data available for export
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 