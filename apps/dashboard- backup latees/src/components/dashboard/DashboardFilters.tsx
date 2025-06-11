'use client'

import { useState } from 'react'
import { CalendarIcon, Filter, X } from 'lucide-react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export interface DashboardFilters {
  dateRange?: DateRange
  heatCheckRange: [number, number]
  callOutcomes: string[]
  searchQuery: string
  presetTimeframe?: string
}

interface DashboardFiltersProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  totalCalls: number
  filteredCalls: number
}

const PRESET_TIMEFRAMES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this-week' },
  { label: 'Last 7 Days', value: 'last-7-days' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last 30 Days', value: 'last-30-days' },
  { label: 'Custom Range', value: 'custom' },
]

const CALL_OUTCOMES = [
  'Call did not connect - voicemail reached',
  'Analysis in progress',
  'Schedule appointment',
  'Follow-up appointment scheduling',
  'Patient inquiry',
  'Information request',
  'Converted',
  'Closed',
  'No show',
  'Cancelled',
]

function getDateRangeForPreset(preset: string): DateRange | undefined {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (preset) {
    case 'today':
      return { from: today, to: today }
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { from: yesterday, to: yesterday }
    case 'this-week':
      const thisWeekStart = new Date(today)
      thisWeekStart.setDate(today.getDate() - today.getDay())
      return { from: thisWeekStart, to: today }
    case 'last-7-days':
      const last7Days = new Date(today)
      last7Days.setDate(today.getDate() - 7)
      return { from: last7Days, to: today }
    case 'this-month':
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: thisMonthStart, to: today }
    case 'last-30-days':
      const last30Days = new Date(today)
      last30Days.setDate(today.getDate() - 30)
      return { from: last30Days, to: today }
    default:
      return undefined
  }
}

export function DashboardFilters({
  filters,
  onFiltersChange,
  totalCalls,
  filteredCalls,
}: DashboardFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const activeFilterCount = [
    filters.dateRange?.from && filters.dateRange?.to,
    filters.heatCheckRange[0] > 0 || filters.heatCheckRange[1] < 10,
    filters.callOutcomes.length > 0,
    filters.searchQuery.length > 0,
  ].filter(Boolean).length

  const updateFilters = (newFilters: Partial<DashboardFilters>) => {
    onFiltersChange({ ...filters, ...newFilters })
  }

  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') {
      updateFilters({ presetTimeframe: preset, dateRange: undefined })
    } else {
      const dateRange = getDateRangeForPreset(preset)
      updateFilters({ presetTimeframe: preset, dateRange })
    }
  }

  const clearAllFilters = () => {
    onFiltersChange({
      heatCheckRange: [0, 10],
      callOutcomes: [],
      searchQuery: '',
      presetTimeframe: undefined,
      dateRange: undefined,
    })
  }

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'dateRange':
        updateFilters({ dateRange: undefined, presetTimeframe: undefined })
        break
      case 'heatCheck':
        updateFilters({ heatCheckRange: [0, 10] })
        break
      case 'outcomes':
        updateFilters({ callOutcomes: [] })
        break
      case 'search':
        updateFilters({ searchQuery: '' })
        break
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Showing {filteredCalls} of {totalCalls} calls
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.dateRange?.from && filters.dateRange?.to && (
            <Badge variant="secondary" className="px-2 py-1">
              {format(filters.dateRange.from, 'MMM dd')} - {format(filters.dateRange.to, 'MMM dd')}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeFilter('dateRange')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {(filters.heatCheckRange[0] > 0 || filters.heatCheckRange[1] < 10) && (
            <Badge variant="secondary" className="px-2 py-1">
              HeatCheck: {filters.heatCheckRange[0]}-{filters.heatCheckRange[1]}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeFilter('heatCheck')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.callOutcomes.length > 0 && (
            <Badge variant="secondary" className="px-2 py-1">
              Outcomes: {filters.callOutcomes.length} selected
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeFilter('outcomes')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.searchQuery && (
            <Badge variant="secondary" className="px-2 py-1">
              Search: "{filters.searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeFilter('search')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Collapsible Filter Panel */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 border rounded-lg bg-muted/50">
            
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Calls</Label>
              <Input
                id="search"
                placeholder="Search prospects, needs, objections..."
                value={filters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              />
            </div>

            {/* Time Range Presets */}
            <div className="space-y-2">
              <Label htmlFor="timeframe">Time Range</Label>
              <Select
                value={filters.presetTimeframe || ''}
                onValueChange={handlePresetChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_TIMEFRAMES.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {filters.presetTimeframe === 'custom' && (
              <div className="space-y-2">
                <Label>Custom Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.dateRange && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                            {format(filters.dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(filters.dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange?.from}
                      selected={filters.dateRange}
                      onSelect={(dateRange: DateRange | undefined) => updateFilters({ dateRange })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* HeatCheck Score Range */}
            <div className="space-y-2">
              <Label>HeatCheck Score Range</Label>
              <div className="px-3">
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={filters.heatCheckRange}
                  onValueChange={(value: number[]) => updateFilters({ heatCheckRange: value as [number, number] })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{filters.heatCheckRange[0]}</span>
                  <span>{filters.heatCheckRange[1]}</span>
                </div>
              </div>
            </div>

          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
} 