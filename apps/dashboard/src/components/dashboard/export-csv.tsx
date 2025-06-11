'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react'

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

interface ExportCSVProps {
  calls: CallData[]
  fileName?: string
}

export function ExportCSV({ calls, fileName = 'sales_call_analysis' }: ExportCSVProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
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
    setExportProgress(10)
    
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
    
    setExportProgress(30)
    
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
    
    setExportProgress(80)
    
    // Add UTF-8 BOM for Excel compatibility
    const bom = '\uFEFF'
    
    setExportProgress(100)
    return bom + csvContent
  }

  const downloadCSV = async () => {
    setIsExporting(true)
    setExportProgress(0)
    
    try {
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
      
      // Clean up
      URL.revokeObjectURL(url)
      
      // Auto-close dialog after successful export
      setTimeout(() => {
        setIsDialogOpen(false)
      }, 1500)
      
    } catch (error) {
      console.error('CSV export failed:', error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export to CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Export Details</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>{calls.length} calls</strong> will be exported</li>
              <li>• All current filters will be applied</li>
              <li>• Compatible with Excel and Google Sheets</li>
              <li>• File size: ~{Math.round(calls.length * 0.2)}KB</li>
            </ul>
          </div>
          
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating CSV...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={downloadCSV} 
              disabled={isExporting || calls.length === 0}
              className="flex-1"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? 'Exporting...' : 'Download CSV'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
          </div>
          
          {calls.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No data available for export
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 