'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CalendarIcon, DownloadIcon, RefreshCwIcon, SearchIcon, FilterIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon, TrendingUpIcon, TrendingDownIcon, PhoneCallIcon, TargetIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TeamPerformanceModern } from './team-performance-modern'
import { ExportUnified } from './export-unified'
import { cn } from '@/lib/utils'

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
  console.log('🔄 transformCallData input:', {
    id: call.id?.slice(0, 8),
    heatcheck_score: call.heatcheck_score,
    hasAnalysis: !!call.analysis
  })
  
  // Cache parsed results to avoid re-parsing
  if (call._transformed) {
    console.log('🔄 Already transformed, returning cached')
    return call
  }

  let heatCheck = call.heatcheck_score || 0  // Use API-parsed score first
  let outcome = call.call_outcome || 'Not specified'  // Use API-parsed outcome first
  let topNeed = call.top_need_pain_point || 'Not specified'  // Use API-parsed need first
  let objection = call.main_objection || 'None identified'  // Use API-parsed objection first

  // Only re-parse if the API didn't provide these fields
  if (!call.heatcheck_score && call.analysis) {
    // Extract HeatCheck with optimized regex
    const heatCheckMatch = call.analysis.match(/HEATCHECK:\s*(\d+)/i)
    if (heatCheckMatch) {
      heatCheck = parseInt(heatCheckMatch[1])
    }
  }
  
  if (!call.call_outcome && call.analysis) {
    // Extract outcome
    const outcomeMatch = call.analysis.match(/OUTCOME:\s*([^\n]+)/i)
    if (outcomeMatch) {
      outcome = outcomeMatch[1].trim()
    }
  }

  if (!call.top_need_pain_point && call.analysis) {
    // Extract top need - simplified
    const needsPatterns = [
      /TOP NEED\/PAIN POINT:\s*([^\n]+)/i,
      /TOP NEED:\s*([^\n]+)/i,
      /PAIN POINT:\s*([^\n]+)/i,
      /NEEDS?:\s*\n?\*?\s*([^\n*]+)/i
    ]
    
    for (const pattern of needsPatterns) {
      const match = call.analysis.match(pattern)
      if (match) {
        topNeed = match[1].trim()
        break
      }
    }
  }

  if (!call.main_objection && call.analysis) {
    // Extract objection - simplified
    const objectionPatterns = [
      /MAIN OBJECTION:\s*([^\n]+)/i,
      /OBJECTIONS?:\s*\n?\*?\s*([^\n*]+)/i
    ]
    
    for (const pattern of objectionPatterns) {
      const match = call.analysis.match(pattern)
      if (match) {
        const objectionText = match[1].trim()
        if (!objectionText.toLowerCase().includes('no significant')) {
          objection = objectionText
        } else {
          objection = 'No significant objections'
        }
        break
      }
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

  console.log('🔄 transformCallData output:', {
    id: transformed.id?.slice(0, 8),
    heatcheck_score: transformed.heatcheck_score,
    type: typeof transformed.heatcheck_score
  })

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

// Enhanced HeatCheck badge with modern styling
const getModernHeatCheckBadge = (score?: number) => {
  console.log('🎯 HeatCheck badge receiving:', score, typeof score, !score)
  if (!score) return <Badge className="bg-gray-100 text-gray-600 font-semibold">N/A</Badge>
  
  if (score >= 8) return (
    <Badge className="heatcheck-elite font-bold text-sm px-3 py-1">
      🔥 {score}
    </Badge>
  )
  if (score >= 6) return (
    <Badge className="heatcheck-high font-bold text-sm px-3 py-1">
      ⚡ {score}
    </Badge>
  )
  if (score >= 4) return (
    <Badge className="heatcheck-medium font-bold text-sm px-3 py-1">
      💧 {score}
    </Badge>
  )
  return (
    <Badge className="heatcheck-low font-bold text-sm px-3 py-1">
      ❄️ {score}
    </Badge>
  )
}

export function DashboardClientModern({ initialCalls, client, clientId }: DashboardClientProps) {
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
  const [dateRange, setDateRange] = useState<{start: string, end: string} | null>(null)

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const supabase = createClient()

  // Function to fetch data with timeframe
  const fetchDataWithTimeframe = useCallback(async (timeframe: string, customStart?: string, customEnd?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        clientId,
        timeframe
      })
      
      if (timeframe === 'custom' && customStart && customEnd) {
        params.append('startDate', customStart)
        params.append('endDate', customEnd)
      }

      const response = await fetch(`/api/dashboard/calls?${params.toString()}`)
      if (response.ok) {
        const newCalls = await response.json()
        console.log('🔍 Raw API data (first call):', newCalls[0])
        console.log('🔍 Raw heatcheck_score:', newCalls[0]?.heatcheck_score, typeof newCalls[0]?.heatcheck_score)
        
        const transformedCalls = newCalls.map((call: any) => transformCallData(call))
        console.log('🔍 Transformed data (first call):', transformedCalls[0])
        console.log('🔍 Transformed heatcheck_score:', transformedCalls[0]?.heatcheck_score, typeof transformedCalls[0]?.heatcheck_score)
        
        setCalls(transformedCalls)
        console.log(`📊 Loaded ${newCalls.length} calls for ${timeframe} timeframe`)
      }
    } catch (error) {
      console.error('Failed to fetch timeframe data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  // Handle timeframe changes
  const handleTimeframeChange = useCallback((newTimeframe: string) => {
    setSelectedTimeframe(newTimeframe)
    setCurrentPage(1) // Reset pagination
    fetchDataWithTimeframe(newTimeframe)
  }, [fetchDataWithTimeframe])

  // Handle custom date range changes
  const handleCustomDateRange = useCallback((start: string, end: string) => {
    setDateRange({ start, end })
    setSelectedTimeframe('custom')
    setCurrentPage(1)
    fetchDataWithTimeframe('custom', start, end)
  }, [fetchDataWithTimeframe])

  // Initial load effect - fetch current timeframe data
  useEffect(() => {
    if (clientId) {
      fetchDataWithTimeframe(selectedTimeframe)
    }
  }, []) // Only run on mount

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

  // Memoized metrics calculation with enhanced analytics
  const metrics = useMemo(() => {
    const totalCalls = filteredCalls.length
    const averageHeatCheck = totalCalls > 0 
      ? Math.round(filteredCalls.reduce((sum, call) => sum + (call.heatcheck_score || 0), 0) / totalCalls * 10) / 10
      : 0
    
    const highPerformingCalls = filteredCalls.filter(call => (call.heatcheck_score || 0) >= 6)
    const conversionRate = totalCalls > 0 ? Math.round((highPerformingCalls.length / totalCalls) * 100) : 0

    // Calculate trend (mock data for demo)
    const previousPeriodConversionRate = conversionRate - 5 // Mock previous period
    const trend = conversionRate - previousPeriodConversionRate

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
      trend,
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
    // Smooth scroll to top of table
    document.querySelector('[data-table-container]')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    // If it's today, show "Today" with time
    if (diffInDays === 0 && date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`
    }
    
    // If it's yesterday, show "Yesterday" with time
    if (diffInDays === 1) {
      return `Yesterday, ${date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`
    }
    
    // For dates within the current week, show day name
    if (diffInDays < 7) {
      return date.toLocaleString('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
    
    // For older dates, show full date
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }, [])

  // Stacked date formatter for table display
  const formatStackedDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    const time = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    // If it's today
    if (diffInDays === 0 && date.toDateString() === now.toDateString()) {
      return { dateLine: 'Today', timeLine: time }
    }
    
    // If it's yesterday
    if (diffInDays === 1) {
      return { dateLine: 'Yesterday', timeLine: time }
    }
    
    // For this week, show day name
    if (diffInDays < 7) {
      return { 
        dateLine: date.toLocaleString('en-US', { weekday: 'long' }),
        timeLine: time
      }
    }
    
    // For older dates
    return {
      dateLine: date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }),
      timeLine: time
    }
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, heatCheckFilter, outcomeFilter])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="loading-pulse">
            <PhoneCallIcon className="h-12 w-12 text-blue-600" />
          </div>
          <span className="ml-3 text-lg font-medium">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-6 space-y-6">
        {/* Modern Header with Glass Morphism */}
        <div className="glass-card rounded-2xl p-6 animate-slide-in">
          <div className="space-y-4">
            <h1 className="dashboard-title">
              {selectedTimeframe === 'daily' ? 'Daily' : selectedTimeframe === 'weekly' ? 'Weekly' : selectedTimeframe === 'monthly' ? 'Monthly' : 'Custom'} Sales Call Analysis
            </h1>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {client?.business_name || 'Loading...'}
                </p>
                <p className="text-sm text-gray-600">
                  Report Period: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Enhanced Real-time status indicator */}
                <Badge 
                  variant={isConnected ? "default" : "secondary"} 
                  className={cn(
                    "px-3 py-1",
                    isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  )} />
                  {isConnected ? 'Live' : 'Offline'}
                </Badge>
                
                {/* Enhanced Time range selector */}
                <Tabs value={selectedTimeframe} onValueChange={handleTimeframeChange} className="bg-white/50 rounded-lg">
                  <TabsList className="bg-white/70">
                    <TabsTrigger value="daily" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                      Today
                    </TabsTrigger>
                    <TabsTrigger value="weekly" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                      This Week
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                      This Month
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                      Custom
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {/* Custom Date Range Picker */}
                {selectedTimeframe === 'custom' && (
                  <div className="flex items-center gap-4 p-3 bg-white/70 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <label className="text-sm font-medium text-gray-700">From:</label>
                      <Input
                        type="date"
                        value={dateRange?.start?.split('T')[0] || ''}
                        onChange={(e) => {
                          const startDate = e.target.value + 'T00:00:00.000Z'
                          if (dateRange?.end) {
                            handleCustomDateRange(startDate, dateRange.end)
                          } else {
                            setDateRange({ start: startDate, end: new Date().toISOString() })
                          }
                        }}
                        className="w-auto border-gray-200 focus:border-blue-400"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">To:</label>
                      <Input
                        type="date"
                        value={dateRange?.end?.split('T')[0] || ''}
                        onChange={(e) => {
                          const endDate = e.target.value + 'T23:59:59.999Z'
                          if (dateRange?.start) {
                            handleCustomDateRange(dateRange.start, endDate)
                          } else {
                            setDateRange({ start: new Date().toISOString(), end: endDate })
                          }
                        }}
                        className="w-auto border-gray-200 focus:border-blue-400"
                      />
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all"
                >
                  <RefreshCwIcon className={cn(
                    "h-4 w-4 mr-2",
                    isRefreshing && "animate-spin"
                  )} />
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
        </div>

        {/* Enhanced Filters with Modern Design */}
        <div className="dashboard-card animate-slide-in" style={{animationDelay: '0.1s'}}>
          <div 
            className="gradient-header"
            style={{
              background: 'var(--gradient-filters)',
              margin: '0',
              padding: '1.5rem',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              borderBottom: 'none'
            }}
          >
            <h2 className="flex items-center gap-2 text-white text-lg font-semibold">
              <FilterIcon className="h-5 w-5 text-white/80" />
              Advanced Filters
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search prospects, needs, objections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">HeatCheck Score</label>
                <Select value={heatCheckFilter} onValueChange={setHeatCheckFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="All scores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="high">🔥 Elite (8-10)</SelectItem>
                    <SelectItem value="medium">⚡ High (6-7)</SelectItem>
                    <SelectItem value="low">❄️ Low (1-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Call Outcome</label>
                <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="All outcomes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="converted">✅ Converted</SelectItem>
                    <SelectItem value="interested">👀 Interested</SelectItem>
                    <SelectItem value="objection">🚫 Had Objections</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="w-full hover:bg-gray-50 transition-all"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            
            {(debouncedSearchTerm || heatCheckFilter !== 'all' || outcomeFilter !== 'all') && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in">
                <p className="text-sm text-blue-700 font-medium">
                  Showing {filteredCalls.length} of {calls.length} calls
                  {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
                  {heatCheckFilter !== 'all' && ` with ${heatCheckFilter} HeatCheck scores`}
                  {outcomeFilter !== 'all' && ` with ${outcomeFilter} outcomes`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Enhanced Performance Metrics */}
        <div className="dashboard-card animate-slide-in" style={{animationDelay: '0.2s'}}>
          <div 
            className="gradient-header"
            style={{
              background: 'var(--gradient-metrics)',
              margin: '0',
              padding: '1.5rem',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              borderBottom: 'none'
            }}
          >
            <h2 className="section-header text-white text-lg font-semibold">
              1. {selectedTimeframe === 'daily' ? 'Daily' : selectedTimeframe === 'weekly' ? 'Weekly' : selectedTimeframe === 'monthly' ? 'Monthly' : 'Custom'} Performance Metrics
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Calls Card */}
              <div className="metric-card group">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <PhoneCallIcon className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="metric-value">{metrics.totalCalls}</p>
                <p className="text-xs text-gray-500 mt-2">Analyzed this period</p>
              </div>

              {/* Average HeatCheck Card */}
              <div className="metric-card group">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Avg HeatCheck</p>
                  <TargetIcon className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="metric-value">{metrics.averageHeatCheck}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${metrics.averageHeatCheck * 10}%` }}
                  />
                </div>
              </div>

              {/* Conversion Rate Card */}
              <div className="metric-card group">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  {metrics.trend > 0 ? (
                    <TrendingUpIcon className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                  ) : (
                    <TrendingDownIcon className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="metric-value">{metrics.conversionRate}%</p>
                  <span className={cn(
                    "text-sm font-semibold",
                    metrics.trend > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {metrics.trend > 0 ? '+' : ''}{metrics.trend}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">High performing calls</p>
              </div>

              {/* Key Insights Card */}
              <div className="metric-card group">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 mb-3">Key Insights</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <p className="text-xs text-gray-600">
                        Top Need: <span className="font-medium">{metrics.topNeeds[0] || 'N/A'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <p className="text-xs text-gray-600">
                        Main Objection: <span className="font-medium">{metrics.topObjections[0] || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Needs and Objections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  Top Customer Needs
                </h4>
                <div className="space-y-3">
                  {metrics.topNeeds.map((need, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/70 p-3 rounded-lg">
                      <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-700">{need}</span>
                    </div>
                  ))}
                  {metrics.topNeeds.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No needs identified yet</p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  Common Objections
                </h4>
                <div className="space-y-3">
                  {metrics.topObjections.map((objection, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/70 p-3 rounded-lg">
                      <span className="text-lg font-bold text-orange-600">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-700">{objection}</span>
                    </div>
                  ))}
                  {metrics.topObjections.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No objections recorded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Top Performing Calls with Modern Cards */}
        <div className="dashboard-card animate-slide-in" style={{animationDelay: '0.3s'}}>
          <div 
            className="gradient-header"
            style={{
              background: 'var(--gradient-performing)',
              margin: '0',
              padding: '1.5rem',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              borderBottom: 'none'
            }}
          >
            <h2 className="section-header text-white text-lg font-semibold">
              2. Top Performing Calls
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.highPerformingCalls.map((call, index) => (
                <div key={call.id} className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{call.prospect_name}</h3>
                        <p className="text-sm text-gray-500">{formatDate(call.date_created)}</p>
                      </div>
                      {getModernHeatCheckBadge(call.heatcheck_score)}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Key Need</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">{call.top_need_pain_point}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">{call.call_outcome}</p>
                      </div>
                      
                      {call.main_objection && call.main_objection !== 'None identified' && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Objection Handled</p>
                          <p className="text-sm text-gray-700 font-medium mt-1">{call.main_objection}</p>
                        </div>
                      )}
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-4 w-full hover:bg-green-50 hover:text-green-700 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Call Details - {call.prospect_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Date</p>
                              <p className="text-sm">{formatDate(call.date_created)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">HeatCheck Score</p>
                              <div className="mt-1">{getModernHeatCheckBadge(call.heatcheck_score)}</div>
                            </div>
                          </div>
                          
                          {call.analysis && (
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-2">Full Analysis</p>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">{call.analysis}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              
              {metrics.highPerformingCalls.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <PhoneCallIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No high-performing calls yet</p>
                  <p className="text-sm text-gray-400 mt-1">Calls with HeatCheck 6+ will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Enhanced Call Breakdown Table */}
        <div className="dashboard-card animate-slide-in" style={{animationDelay: '0.4s'}}>
          <div 
            className="gradient-header"
            style={{
              background: 'var(--gradient-breakdown)',
              margin: '0',
              padding: '1.5rem',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              borderBottom: 'none'
            }}
          >
            <h2 className="section-header text-gray-800 text-lg font-semibold">
              3. Detailed Call Breakdown
            </h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto" data-table-container>
              <table className="w-full modern-table">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Prospect</th>
                    <th className="px-6 py-4">HeatCheck</th>
                    <th className="px-6 py-4">Top Need</th>
                    <th className="px-6 py-4">Objection</th>
                    <th className="px-6 py-4">Outcome</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {(() => {
                          const { dateLine, timeLine } = formatStackedDate(call.date_created)
                          return (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{dateLine}</div>
                              <div className="text-xs text-gray-500">{timeLine}</div>
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{call.prospect_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getModernHeatCheckBadge(call.heatcheck_score)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 max-w-xs truncate" title={call.top_need_pain_point}>
                          {call.top_need_pain_point}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 max-w-xs truncate" title={call.main_objection}>
                          {call.main_objection}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 max-w-xs truncate" title={call.call_outcome}>
                          {call.call_outcome}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-purple-50 hover:text-purple-700"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Call Details - {call.prospect_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Date</p>
                                  <p className="text-sm">{formatDate(call.date_created)}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">HeatCheck Score</p>
                                  <div className="mt-1">{getModernHeatCheckBadge(call.heatcheck_score)}</div>
                                </div>
                              </div>
                              
                              {call.analysis && (
                                <div>
                                  <p className="text-sm font-medium text-gray-500 mb-2">Full Analysis</p>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">{call.analysis}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {paginatedCalls.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <SearchIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No calls found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>
            
            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, filteredCalls.length)}</span> of{' '}
                  <span className="font-medium">{filteredCalls.length}</span> results
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="hover:bg-gray-50"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = currentPage <= 3 ? i + 1 : currentPage + i - 2
                      if (pageNumber > totalPages) return null
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={pageNumber === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className={cn(
                            "w-10",
                            pageNumber === currentPage && "bg-blue-600 hover:bg-blue-700"
                          )}
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="hover:bg-gray-50"
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Team Performance */}
        <div className="animate-slide-in" style={{animationDelay: '0.5s'}}>
          <TeamPerformanceModern 
            clientId={clientId} 
          />
        </div>
      </div>
    </div>
  )
} 