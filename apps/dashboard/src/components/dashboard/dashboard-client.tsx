'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CalendarIcon, DownloadIcon, RefreshCwIcon, SearchIcon, FilterIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TeamPerformance } from './team-performance'
import { ExportUnified } from './export-unified'

interface CallData {
  id: string
  client_id: string
  conversation_id: string
  date_created: string
  contact_name?: string
  analysis?: string
  call_source?: string
  direction?: string
  transcript?: string
  // Parsed fields
  prospect_name?: string
  heatcheck_score?: number
  top_need_pain_point?: string
  main_objection?: string
  call_outcome?: string
}

interface Client {
  id: string
  client_id: string
  business_name: string
  industry: string
  status: 'active' | 'suspended' | 'inactive'
  location_id: string
  ghl_api_token: string
  zoom_user_id?: string
  zoom_topic_prefix?: string
  assistant_id: string
  created_at: string
  updated_at: string
}

interface DashboardClientProps {
  initialCalls: CallData[]
  client: Client | null
  clientId: string
}

// Memoized transform function to avoid repeated parsing
const transformCallData = (call: any): CallData => {
  // Cache parsed results to avoid re-parsing
  if (call._transformed) {
    return call
  }

  let heatCheck = 0
  let outcome = 'Not specified'
  let topNeed = 'Not specified'
  let objection = 'None identified'

  if (call.analysis) {
    // Extract HeatCheck with optimized regex
    const heatCheckMatch = call.analysis.match(/HEATCHECK:\s*(\d+)/i)
    if (heatCheckMatch) {
      heatCheck = parseInt(heatCheckMatch[1])
    }
    
    // Extract outcome
    const outcomeMatch = call.analysis.match(/OUTCOME:\s*([^\n]+)/i)
    if (outcomeMatch) {
      outcome = outcomeMatch[1].trim()
    }

    // Extract top need - simplified
    const needsMatch = call.analysis.match(/NEEDS?:\s*\n?\*?\s*([^\n*]+)/i)
    if (needsMatch) {
      topNeed = needsMatch[1].trim()
    }

    // Extract objection - simplified
    const objectionMatch = call.analysis.match(/OBJECTIONS?:\s*\n?\*?\s*([^\n*]+)/i)
    if (objectionMatch && !objectionMatch[1].toLowerCase().includes('no significant')) {
      objection = objectionMatch[1].trim()
    } else if (objectionMatch && objectionMatch[1].toLowerCase().includes('no significant')) {
      objection = 'No significant objections'
    }
  }
  
  const transformed = {
    ...call,
    prospect_name: call.contact_name || 'Unknown Prospect',
    heatcheck_score: heatCheck,
    top_need_pain_point: topNeed,
    main_objection: objection,
    call_outcome: outcome,
    _transformed: true
  }

  return transformed
}

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function DashboardClient({ initialCalls, client, clientId }: DashboardClientProps) {
  // Transform initial calls once
  const [calls, setCalls] = useState<CallData[]>(() => 
    initialCalls.map(call => transformCallData(call))
  )
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [heatCheckFilter, setHeatCheckFilter] = useState('all')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25) // Fixed page size for better performance
  const [isLoading, setIsLoading] = useState(false)

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const supabase = createClient()

  // Optimized real-time subscription with throttling
  useEffect(() => {
    if (!clientId) return

    console.log('🔄 Setting up real-time subscription for client:', clientId)
    
    let updateBuffer: any[] = []
    let updateTimeout: NodeJS.Timeout | null = null

    const processUpdates = () => {
      if (updateBuffer.length > 0) {
        const newCalls = updateBuffer.map(call => transformCallData(call))
        setCalls(current => {
          const callIds = new Set(current.map(c => c.id))
          const uniqueNewCalls = newCalls.filter(call => !callIds.has(call.id))
          return [...uniqueNewCalls, ...current].slice(0, 500) // Limit to 500 calls
        })
        updateBuffer = []
      }
    }
    
    const channel = supabase
      .channel(`calls-${clientId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'call_messages',
        filter: `client_id=eq.${clientId}`
      }, (payload: any) => {
        // Buffer updates to avoid too frequent re-renders
        updateBuffer.push(payload.new)
        
        if (updateTimeout) clearTimeout(updateTimeout)
        updateTimeout = setTimeout(processUpdates, 1000) // Process updates every 1 second
      })
      .subscribe((status: string) => {
        console.log('📡 Subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      if (updateTimeout) clearTimeout(updateTimeout)
      supabase.removeChannel(channel)
    }
  }, [clientId, supabase])

  // Optimized filtering with useMemo and proper dependencies
  const filteredCalls = useMemo(() => {
    console.log('🔄 Filtering calls...', { 
      totalCalls: calls.length, 
      searchTerm: debouncedSearchTerm,
      heatCheckFilter,
      outcomeFilter 
    })

    if (calls.length === 0) return []

    return calls.filter(call => {
      // Search filter with debounced term
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase()
        const searchableText = [
          call.prospect_name,
          call.top_need_pain_point,
          call.main_objection,
          call.call_outcome
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchLower)) return false
      }

      // HeatCheck filter
      if (heatCheckFilter !== 'all') {
        const score = call.heatcheck_score || 0
        switch (heatCheckFilter) {
          case 'high': if (score < 8) return false; break
          case 'medium': if (score < 6 || score >= 8) return false; break
          case 'low': if (score >= 6) return false; break
        }
      }

      // Outcome filter with optimized matching
      if (outcomeFilter !== 'all') {
        const outcome = call.call_outcome?.toLowerCase() || ''
        switch (outcomeFilter) {
          case 'converted':
            if (!(/contract|signed|closed|converted/.test(outcome))) return false
            break
          case 'interested':
            if (!(/interested|follow|demo|scheduled/.test(outcome))) return false
            break
          case 'objection':
            if (!(/objection|concerns|hesitant|pricing/.test(outcome))) return false
            break
        }
      }

      return true
    })
  }, [calls, debouncedSearchTerm, heatCheckFilter, outcomeFilter])

  // Paginated calls for table display
  const paginatedCalls = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredCalls.slice(startIndex, startIndex + pageSize)
  }, [filteredCalls, currentPage, pageSize])

  // Calculate total pages
  const totalPages = Math.ceil(filteredCalls.length / pageSize)

  // Memoized metrics calculation
  const metrics = useMemo(() => {
    const totalCalls = filteredCalls.length
    const averageHeatCheck = totalCalls > 0 
      ? Math.round(filteredCalls.reduce((sum, call) => sum + (call.heatcheck_score || 0), 0) / totalCalls * 10) / 10
      : 0
    
    const highPerformingCalls = filteredCalls.filter(call => (call.heatcheck_score || 0) >= 6)
    const conversionRate = totalCalls > 0 ? Math.round((highPerformingCalls.length / totalCalls) * 100) : 0

    // Optimized top needs/objections calculation
    const needsMap = new Map<string, number>()
    const objectionsMap = new Map<string, number>()

    filteredCalls.forEach(call => {
      if (call.top_need_pain_point && call.top_need_pain_point !== 'Not specified') {
        needsMap.set(call.top_need_pain_point, (needsMap.get(call.top_need_pain_point) || 0) + 1)
      }
      if (call.main_objection && call.main_objection !== 'None identified' && call.main_objection !== 'Not specified') {
        objectionsMap.set(call.main_objection, (objectionsMap.get(call.main_objection) || 0) + 1)
      }
    })

    const topNeeds = Array.from(needsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([need]) => need)

    const topObjections = Array.from(objectionsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([objection]) => objection)

    return {
      totalCalls,
      averageHeatCheck,
      conversionRate,
      topNeeds,
      topObjections,
      highPerformingCalls: highPerformingCalls.slice(0, 3)
    }
  }, [filteredCalls])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setIsLoading(true)
    try {
      const response = await fetch(`/api/dashboard/calls?clientId=${clientId}`)
      if (response.ok) {
        const newCalls = await response.json()
        setCalls(newCalls.map((call: any) => transformCallData(call)))
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }, [clientId])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setHeatCheckFilter('all')
    setOutcomeFilter('all')
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
    // Scroll to top of table
    document.querySelector('[data-table-container]')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const getHeatCheckBadge = useCallback((score?: number) => {
    if (!score) return <Badge variant="secondary">N/A</Badge>
    
    if (score >= 8) return <Badge className="bg-green-100 text-green-800">🔥 {score}</Badge>
    if (score >= 6) return <Badge className="bg-yellow-100 text-yellow-800">⚡ {score}</Badge>
    if (score >= 4) return <Badge className="bg-blue-100 text-blue-800">💧 {score}</Badge>
    return <Badge variant="secondary">❄️ {score}</Badge>
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, heatCheckFilter, outcomeFilter])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {selectedTimeframe === 'daily' ? 'Daily' : selectedTimeframe === 'weekly' ? 'Weekly' : 'Custom'} Sales Call Analysis Report
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-lg text-muted-foreground">
            {client?.business_name || 'Loading...'} | Ending Date: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          
          <div className="flex items-center gap-2">
            {/* Real-time status indicator */}
            <Badge variant={isConnected ? "default" : "secondary"} className="mr-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
            
            {/* Time range selector */}
            <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <TabsList>
                <TabsTrigger value="daily">Today</TabsTrigger>
                <TabsTrigger value="weekly">This Week</TabsTrigger>
                <TabsTrigger value="custom">Custom Range</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <ExportUnified
              calls={filteredCalls}
              client={client}
              timeframe={selectedTimeframe}
              totalCalls={metrics.totalCalls}
              averageHeatCheck={metrics.averageHeatCheck}
              conversionRate={metrics.conversionRate}
              topNeeds={metrics.topNeeds}
              topObjections={metrics.topObjections}
              fileName={`${client?.business_name || 'sales'}_call_analysis`}
            />
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prospects, needs, objections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">HeatCheck Score</label>
              <Select value={heatCheckFilter} onValueChange={setHeatCheckFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (8-10)</SelectItem>
                  <SelectItem value="medium">Medium (6-7)</SelectItem>
                  <SelectItem value="low">Low (1-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Call Outcome</label>
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All outcomes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="objection">Had Objections</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
          
          {(debouncedSearchTerm || heatCheckFilter !== 'all' || outcomeFilter !== 'all') && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Showing {filteredCalls.length} of {calls.length} calls
                {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
                {heatCheckFilter !== 'all' && ` with ${heatCheckFilter} HeatCheck scores`}
                {outcomeFilter !== 'all' && ` with ${outcomeFilter} outcomes`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 1: Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>1. {selectedTimeframe === 'daily' ? 'Daily' : 'Weekly'} Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Total number of calls analyzed:</p>
              <p className="text-2xl font-bold">{metrics.totalCalls}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Average HeatCheck score:</p>
              <p className="text-2xl font-bold">{metrics.averageHeatCheck}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Conversion rate:</p>
              <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Real-time Status:</p>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? '🔴 Live' : '⚠️ Offline'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="font-medium">Top 3 most common prospect needs/pain points:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {metrics.topNeeds.length > 0 ? (
                  metrics.topNeeds.map((need, index) => (
                    <li key={index}>{need}</li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No data available</li>
                )}
              </ol>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Top 3 most frequent objections:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {metrics.topObjections.length > 0 ? (
                  metrics.topObjections.map((objection, index) => (
                    <li key={index}>{objection}</li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No data available</li>
                )}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Top Performing Calls */}
      <Card>
        <CardHeader>
          <CardTitle>2. Top Performing Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.highPerformingCalls.map((call) => (
              <div key={call.id} className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      Call with {call.prospect_name} - HeatCheck Score: {call.heatcheck_score}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {call.call_outcome?.substring(0, 100)}...
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCall(call)}>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Call Details - {call.prospect_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-sm">HeatCheck Score</p>
                            {getHeatCheckBadge(call.heatcheck_score)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">Date & Time</p>
                            <p className="text-sm">{formatDate(call.date_created)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-2">Top Need/Pain Point</p>
                          <p className="text-sm bg-blue-50 p-3 rounded">{call.top_need_pain_point}</p>
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-2">Main Objection</p>
                          <p className="text-sm bg-yellow-50 p-3 rounded">{call.main_objection}</p>
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-2">Call Outcome</p>
                          <p className="text-sm bg-green-50 p-3 rounded">{call.call_outcome}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            {metrics.highPerformingCalls.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No high-performing calls found (HeatCheck score 6+)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Detailed Call Breakdown with Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>3. Detailed Call Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredCalls.length)} of {filteredCalls.length} calls
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto" data-table-container>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Date & Time</th>
                    <th className="text-left p-3 font-medium">Prospect Name</th>
                    <th className="text-left p-3 font-medium">HeatCheck Score</th>
                    <th className="text-left p-3 font-medium">Top Need/Pain Point</th>
                    <th className="text-left p-3 font-medium">Main Objection</th>
                    <th className="text-left p-3 font-medium">Call Outcome</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCalls.length > 0 ? (
                    paginatedCalls.map((call) => (
                      <tr key={call.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{formatDate(call.date_created)}</td>
                        <td className="p-3 font-medium">{call.prospect_name}</td>
                        <td className="p-3">{getHeatCheckBadge(call.heatcheck_score)}</td>
                        <td className="p-3 max-w-xs">
                          <p className="truncate" title={call.top_need_pain_point}>
                            {call.top_need_pain_point}
                          </p>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="truncate" title={call.main_objection}>
                            {call.main_objection}
                          </p>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="truncate" title={call.call_outcome}>
                            {call.call_outcome}
                          </p>
                        </td>
                        <td className="p-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedCall(call)}>
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Call Details - {call.prospect_name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium text-sm">HeatCheck Score</p>
                                    {getHeatCheckBadge(call.heatcheck_score)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">Date & Time</p>
                                    <p className="text-sm">{formatDate(call.date_created)}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-sm mb-2">Top Need/Pain Point</p>
                                  <p className="text-sm bg-blue-50 p-3 rounded">{call.top_need_pain_point}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-sm mb-2">Main Objection</p>
                                  <p className="text-sm bg-yellow-50 p-3 rounded">{call.main_objection}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-sm mb-2">Call Outcome</p>
                                  <p className="text-sm bg-green-50 p-3 rounded">{call.call_outcome}</p>
                                </div>
                                {call.transcript && (
                                  <div>
                                    <p className="font-medium text-sm mb-2">Transcript</p>
                                    <div className="text-sm bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                                      {call.transcript}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">
                        No calls found matching the current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                  const pageNumber = Math.max(1, Math.min(currentPage - 2 + index, totalPages - 4)) + Math.min(index, 4)
                  if (pageNumber > totalPages) return null
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Team Performance Summary */}
      <TeamPerformance clientId={clientId} />
    </div>
  )
} 