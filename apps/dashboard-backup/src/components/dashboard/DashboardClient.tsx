'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Phone, 
  TrendingUp, 
  Target, 
  Users, 
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Call {
  id: string
  client_id: string
  prospect_name: string
  heatcheck_score: number
  top_need_pain_point: string
  main_objection: string
  call_outcome: string
  team_member: string | null
  member_role: string | null
  call_date: string
  call_source: string
  business_name: string
  industry: string
}

interface Client {
  client_id: string
  business_name: string
  industry: string
  status: string
}

interface TeamPerformance {
  member_name: string
  appointment_calls: number
  price_presentations: number
  converted_calls: number
  deal_positive_responses: number
  deal_demos: number
  deal_closed: number
}

interface DashboardClientProps {
  calls: Call[]
  clients: Client[]
  teamPerformance: TeamPerformance[]
}

export function DashboardClient({ calls, clients, teamPerformance }: DashboardClientProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')

  // Add debugging at component entry
  useEffect(() => {
    console.log('🔍 [DEBUG] DashboardClient received props:', {
      callsCount: calls?.length,
      clientsCount: clients?.length,
      teamPerformanceCount: teamPerformance?.length,
      firstCall: calls?.[0],
      firstClient: clients?.[0],
      hasValidHeatChecks: calls?.filter(c => c.heatcheck_score > 0).length || 0
    })
    
    // Log detailed call data for debugging
    if (calls?.length > 0) {
      console.log('🔍 [DEBUG] Sample call data:', {
        prospectName: calls[0].prospect_name,
        heatCheckScore: calls[0].heatcheck_score,
        topNeed: calls[0].top_need_pain_point,
        objection: calls[0].main_objection,
        outcome: calls[0].call_outcome?.substring(0, 100) + '...'
      })
    }
  }, [calls, clients, teamPerformance])

  // Calculate performance metrics from real data
  const metrics = useMemo(() => {
    console.log('🔍 [DEBUG] Calculating metrics with calls:', calls?.length || 0)
    
    if (!calls || calls.length === 0) {
      console.log('🔍 [DEBUG] No calls data - returning empty metrics')
      return {
        totalCalls: 0,
        avgHeatCheck: 0,
        topNeeds: [],
        topObjections: [],
        conversionRate: 0,
        topPerformingCalls: []
      }
    }

    console.log('🔍 [DEBUG] Processing', calls.length, 'calls for metrics')

    // Total calls
    const totalCalls = calls.length

    // Average HeatCheck score
    const validScores = calls.filter(call => call.heatcheck_score && call.heatcheck_score > 0)
    const avgHeatCheck = validScores.length > 0 
      ? Math.round((validScores.reduce((sum, call) => sum + call.heatcheck_score, 0) / validScores.length) * 10) / 10
      : 0

    // Top needs aggregation
    const needsCount = {}
    calls.forEach(call => {
      if (call.top_need_pain_point && call.top_need_pain_point.trim()) {
        const need = call.top_need_pain_point.trim()
        needsCount[need] = (needsCount[need] || 0) + 1
      }
    })
    const topNeeds = Object.entries(needsCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([need]) => need)

    // Top objections aggregation
    const objectionsCount = {}
    calls.forEach(call => {
      if (call.main_objection && call.main_objection.trim()) {
        const objection = call.main_objection.trim()
        objectionsCount[objection] = (objectionsCount[objection] || 0) + 1
      }
    })
    const topObjections = Object.entries(objectionsCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([objection]) => objection)

    // Conversion rate (simplified - looking for positive outcomes)
    const convertedCalls = calls.filter(call => 
      call.call_outcome && (
        call.call_outcome.toLowerCase().includes('convert') ||
        call.call_outcome.toLowerCase().includes('closed') ||
        call.call_outcome.toLowerCase().includes('sold') ||
        call.call_outcome.toLowerCase().includes('demo')
      )
    ).length
    const conversionRate = totalCalls > 0 ? Math.round((convertedCalls / totalCalls) * 100) : 0

    // Top performing calls (high HeatCheck scores)
    const topPerformingCalls = calls
      .filter(call => call.heatcheck_score >= 6)
      .sort((a, b) => b.heatcheck_score - a.heatcheck_score)
      .slice(0, 3)

    const calculatedMetrics = {
      totalCalls,
      avgHeatCheck,
      topNeeds,
      topObjections,
      conversionRate,
      topPerformingCalls
    }

    console.log('🔍 [DEBUG] Calculated metrics:', calculatedMetrics)
    return calculatedMetrics
  }, [calls])

  console.log('🔍 [DEBUG] DashboardClient rendering with metrics:', {
    totalCalls: metrics.totalCalls,
    hasData: metrics.totalCalls > 0
  })

  const getHeatCheckColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-yellow-500'
    if (score >= 4) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getHeatCheckVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 8) return 'default' // Green
    if (score >= 6) return 'secondary' // Yellow/Amber
    return 'destructive' // Red
  }

  return (
    <div className="space-y-6">
      {/* Data Quality Indicator */}
      {calls.length > 0 && (
        <div className="mb-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ✅ Connected to production database with {calls.length} calls loaded. 
              {metrics.totalCalls > 0 && ` Valid HeatCheck scores: ${calls.filter(c => c.heatcheck_score > 0).length}/${calls.length}`}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Performance Metrics Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">1. Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Total Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCalls}</div>
              <p className="text-xs text-muted-foreground">calls analyzed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Avg HeatCheck
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgHeatCheck}</div>
              <Progress value={(metrics.avgHeatCheck / 10) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
              <Progress value={metrics.conversionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">clients active</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Needs & Objections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 3 Prospect Needs/Pain Points</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topNeeds.length > 0 ? (
              <ol className="space-y-2">
                {metrics.topNeeds.map((need, index) => (
                  <li key={index} className="flex items-start">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    <span className="text-sm">{need}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No needs data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 3 Frequent Objections</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topObjections.length > 0 ? (
              <ol className="space-y-2">
                {metrics.topObjections.map((objection, index) => (
                  <li key={index} className="flex items-start">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    <span className="text-sm">{objection}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No objection data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Calls */}
      <div>
        <h2 className="text-xl font-semibold mb-4">2. Top Performing Calls</h2>
        <div className="space-y-4">
          {metrics.topPerformingCalls.length > 0 ? (
            metrics.topPerformingCalls.map((call, index) => (
              <Card key={call.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">Call with {call.prospect_name}</span>
                        <Badge variant={getHeatCheckVariant(call.heatcheck_score)}>
                          HeatCheck: {call.heatcheck_score}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Outcome:</strong> {call.call_outcome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Top Need:</strong> {call.top_need_pain_point}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(call.call_date).toLocaleDateString()}
                      </p>
                      {call.team_member && (
                        <p className="text-xs text-muted-foreground">
                          {call.team_member}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">No high-performing calls found (HeatCheck ≥ 6)</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detailed Call Breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4">3. Detailed Call Breakdown</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date & Time</th>
                    <th className="text-left py-2">Prospect Name</th>
                    <th className="text-left py-2">HeatCheck</th>
                    <th className="text-left py-2">Top Need</th>
                    <th className="text-left py-2">Main Objection</th>
                    <th className="text-left py-2">Call Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.slice(0, 10).map((call) => (
                    <tr key={call.id} className="border-b hover:bg-muted/50">
                      <td className="py-2">
                        {call.call_date ? new Date(call.call_date).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-2 font-medium">{call.prospect_name || 'Unknown'}</td>
                      <td className="py-2">
                        <Badge variant={getHeatCheckVariant(call.heatcheck_score)}>
                          {call.heatcheck_score || 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-2 max-w-[200px] truncate">
                        {call.top_need_pain_point || 'N/A'}
                      </td>
                      <td className="py-2 max-w-[200px] truncate">
                        {call.main_objection || 'N/A'}
                      </td>
                      <td className="py-2 max-w-[200px] truncate">
                        {call.call_outcome || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {calls.length > 10 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing first 10 of {calls.length} calls
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Section */}
      {teamPerformance && teamPerformance.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">4. Team Performance Summary</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Team Member</th>
                      <th className="text-left py-2">Appointment Calls</th>
                      <th className="text-left py-2">Price Presentations</th>
                      <th className="text-left py-2">Converted</th>
                      <th className="text-left py-2">Deal Responses</th>
                      <th className="text-left py-2">Deal Demos</th>
                      <th className="text-left py-2">Deal Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPerformance.map((member, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-2 font-medium">{member.member_name}</td>
                        <td className="py-2">{member.appointment_calls}</td>
                        <td className="py-2">{member.price_presentations}</td>
                        <td className="py-2">{member.converted_calls}</td>
                        <td className="py-2">{member.deal_positive_responses}</td>
                        <td className="py-2">{member.deal_demos}</td>
                        <td className="py-2">{member.deal_closed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
