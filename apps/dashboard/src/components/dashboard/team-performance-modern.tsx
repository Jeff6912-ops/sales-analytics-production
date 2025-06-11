'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, TrendingUp, Phone, Target, Award, AlertCircle, RefreshCw, BarChart3, Zap, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeamMember {
  id: string
  member_name: string
  member_role: string
  common_phrases: string[]
  client_id: string
  created_at: string
}

interface TeamPerformanceMetrics {
  team_member: string
  member_role: string
  total_calls: number
  appointment_calls: number
  price_presentations: number
  converted_calls: number
  avg_heatcheck: number | null
  deal_positive_responses: number
  deal_demos: number
  deal_closed: number
  // Legacy fields for backwards compatibility
  member_name?: string
  presentations?: number
  conversions?: number
  conversion_rate?: number
}

interface TeamPerformanceProps {
  clientId: string
}

export function TeamPerformanceModern({ clientId }: TeamPerformanceProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<TeamPerformanceMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasTeamData, setHasTeamData] = useState(false)
  const [setupProgress, setSetupProgress] = useState(0)

  // Helper function to calculate conversion rate
  const getConversionRate = (metric: TeamPerformanceMetrics): number => {
    return metric.total_calls > 0 ? Math.round((metric.converted_calls / metric.total_calls) * 100) : 0
  }

  // Helper function to get avg heatcheck with null handling
  const getAvgHeatcheck = (metric: TeamPerformanceMetrics): number => {
    return metric.avg_heatcheck || 0
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let isMounted = true

    const fetchTeamData = async () => {
      if (!isMounted) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        console.log('🔍 [TeamPerformance] Fetching data for client:', clientId)
        
        // Set a shorter timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.log('⏰ [TeamPerformance] Request timed out after 5 seconds')
            setError('Request timed out. The dashboard is working, team data setup is optional.')
            setIsLoading(false)
          }
        }, 5000) // 5 second timeout

        // Check if team data exists
        const checkResponse = await fetch(`/api/dashboard/team-performance?clientId=${clientId}`)
        
        if (!isMounted) return
        
        if (!checkResponse.ok) {
          throw new Error(`HTTP ${checkResponse.status}: Failed to check team data`)
        }
        
        const checkData = await checkResponse.json()
        console.log('📊 [TeamPerformance] API Response:', checkData)
        
        if (timeoutId) clearTimeout(timeoutId)
        
        if (!isMounted) return
        
        if (checkData.hasTeamData) {
          console.log('✅ [TeamPerformance] Team data found, setting up...')
          setHasTeamData(true)
          setTeamMembers(checkData.teamMembers || [])
          setPerformanceMetrics(checkData.performanceMetrics || [])
        } else {
          console.log('❌ [TeamPerformance] No team data found for client')
          setHasTeamData(false)
          setTeamMembers([])
          setPerformanceMetrics([])
        }
        
      } catch (err) {
        console.error('💥 [TeamPerformance] Error fetching team data:', err)
        if (isMounted) {
          setError('Unable to load team data. Dashboard features still work normally.')
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
        if (isMounted) {
          setIsLoading(false)
          console.log('🏁 [TeamPerformance] Loading complete')
        }
      }
    }

    if (clientId) {
      console.log('🚀 [TeamPerformance] Starting fetch for client:', clientId)
      fetchTeamData()
    } else {
      console.log('⚠️ [TeamPerformance] No client ID provided')
      setIsLoading(false)
      setError('No client ID provided')
    }

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [clientId])

  const handleSetupTeamData = async () => {
    setIsLoading(true)
    setError(null)
    setSetupProgress(0)

    try {
      // Simulate progress
      const progressSteps = [20, 40, 60, 80, 100]
      
      for (let i = 0; i < progressSteps.length; i++) {
        setSetupProgress(progressSteps[i])
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      const response = await fetch('/api/dummy-data/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      })

      if (!response.ok) {
        throw new Error('Failed to setup team data')
      }

      const data = await response.json()
      setTeamMembers(data.teamMembers || [])
      setPerformanceMetrics(data.performanceMetrics || [])
      setHasTeamData(true)
      
    } catch (err) {
      console.error('Error setting up team data:', err)
      setError(err instanceof Error ? err.message : 'Failed to setup team data')
    } finally {
      setIsLoading(false)
      setSetupProgress(0)
    }
  }

  const handleRefresh = async () => {
    // Reset state and refetch
    setTeamMembers([])
    setPerformanceMetrics([])
    setHasTeamData(false)
    
    // Trigger re-fetch
    const checkResponse = await fetch(`/api/dashboard/team-performance?clientId=${clientId}`)
    if (checkResponse.ok) {
      const checkData = await checkResponse.json()
      if (checkData.hasTeamData) {
        setHasTeamData(true)
        setTeamMembers(checkData.teamMembers || [])
        setPerformanceMetrics(checkData.performanceMetrics || [])
      }
    }
  }

  // Get top performer
  const topPerformer = performanceMetrics.reduce((prev, current) => {
    const prevRate = prev.total_calls > 0 ? (prev.converted_calls / prev.total_calls) * 100 : 0
    const currentRate = current.total_calls > 0 ? (current.converted_calls / current.total_calls) * 100 : 0
    return currentRate > prevRate ? current : prev
  }, performanceMetrics[0] || {})

  if (error) {
    return (
      <div className="dashboard-card">
        <div 
          className="gradient-header"
          style={{
            background: 'var(--gradient-team)',
            margin: '0',
            padding: '1.5rem',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            borderBottom: 'none'
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="section-header text-white text-lg font-semibold">
              4. Team Performance Summary
            </h2>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800">Error Loading Team Data</h3>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div 
          className="gradient-header"
          style={{
            background: 'var(--gradient-team)',
            margin: '0',
            padding: '1.5rem',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            borderBottom: 'none'
          }}
        >
          <h2 className="section-header text-white text-lg font-semibold">
            4. Team Performance Summary
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="loading-pulse">
              <Users className="h-12 w-12 text-teal-600" />
            </div>
            {setupProgress > 0 && (
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Setting up team data...</span>
                  <span>{setupProgress}%</span>
                </div>
                <Progress value={setupProgress} className="h-3 bg-gray-200">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-500" />
                </Progress>
              </div>
            )}
            <p className="text-sm text-gray-600">
              {setupProgress > 0 ? 'Creating team performance data...' : 'Loading team metrics...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasTeamData) {
    return (
      <div className="dashboard-card">
        <div 
          className="gradient-header"
          style={{
            background: 'var(--gradient-team)',
            margin: '0',
            padding: '1.5rem',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            borderBottom: 'none'
          }}
        >
          <h2 className="section-header text-white text-lg font-semibold">
            4. Team Performance Summary
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Users className="h-10 w-10 text-teal-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-800">Team Performance Ready</h3>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Set up dummy team data to see performance metrics and test the dashboard features.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl text-left max-w-md mx-auto border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                What will be created:
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>3-6 team members with realistic roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>Call assignments based on common phrases</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>Performance metrics and conversion rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>Interactive team performance table</span>
                </li>
              </ul>
            </div>
            
            <Button onClick={handleSetupTeamData} className="button-primary">
              <Target className="h-4 w-4 mr-2" />
              Setup Team Performance Demo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-card">
      <div 
        className="gradient-header"
        style={{
          background: 'var(--gradient-team)',
          margin: '0',
          padding: '1.5rem',
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem',
          borderBottom: 'none'
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="section-header text-white text-lg font-semibold">
            4. Team Performance Summary
          </h2>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="detailed"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Detailed Metrics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="metric-card group">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Team Size</p>
                  <Users className="h-5 w-5 text-teal-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="metric-value">{teamMembers.length}</p>
                <p className="text-xs text-gray-500 mt-2">Active members</p>
              </div>

              <div className="metric-card group">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <Phone className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="metric-value">
                  {performanceMetrics.reduce((sum, member) => sum + member.total_calls, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Assigned to team</p>
              </div>

              <div className="metric-card group">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
                  <TrendingUp className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="metric-value">
                  {performanceMetrics.length > 0 
                    ? Math.round(performanceMetrics.reduce((sum, member) => sum + getConversionRate(member), 0) / performanceMetrics.length)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Team average</p>
              </div>

              <div className="metric-card group">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Top Performer</p>
                  <Trophy className="h-5 w-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {topPerformer?.team_member || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {topPerformer ? getConversionRate(topPerformer) : 0}% conversion
                </p>
              </div>
            </div>

            {/* Team Member Cards */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                Team Members Performance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => {
                  const metrics = performanceMetrics.find(m => m.team_member === member.member_name)
                  const isTopPerformer = metrics?.team_member === topPerformer?.team_member
                  
                  return (
                    <div 
                      key={member.id} 
                      className={cn(
                        "relative bg-white rounded-xl border transition-all duration-300",
                        isTopPerformer ? "border-yellow-400 shadow-lg" : "border-gray-200 hover:shadow-md"
                      )}
                    >
                      {isTopPerformer && (
                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-yellow-600" />
                        </div>
                      )}
                      
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-800">{member.member_name}</h3>
                            <p className="text-sm text-gray-600">{member.member_role}</p>
                          </div>
                          <Badge 
                            className={cn(
                              "font-semibold",
                              metrics && getConversionRate(metrics) >= 30 
                                ? "bg-green-100 text-green-800" 
                                : metrics && getConversionRate(metrics) >= 15 
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {metrics ? getConversionRate(metrics) : 0}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Calls</span>
                            <span className="text-sm font-semibold text-gray-800">{metrics?.total_calls || 0}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Conversions</span>
                            <span className="text-sm font-semibold text-green-600">{metrics?.converted_calls || 0}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg HeatCheck</span>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-orange-500" />
                              <span className="text-sm font-semibold text-gray-800">{metrics ? getAvgHeatcheck(metrics) : 0}</span>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Performance</span>
                              <span className="text-xs font-medium text-gray-600">{metrics ? getConversionRate(metrics) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={cn(
                                  "h-2 rounded-full transition-all duration-1000",
                                  metrics && getConversionRate(metrics) >= 30 
                                    ? "bg-gradient-to-r from-green-400 to-emerald-500" 
                                    : metrics && getConversionRate(metrics) >= 15 
                                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                    : "bg-gradient-to-r from-gray-400 to-gray-500"
                                )}
                                style={{ width: `${metrics ? getConversionRate(metrics) : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="detailed" className="space-y-6 mt-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full modern-table bg-white">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      <th className="px-6 py-4">Team Member</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-center">Total Calls</th>
                      <th className="px-6 py-4 text-center">Appointments</th>
                      <th className="px-6 py-4 text-center">Presentations</th>
                      <th className="px-6 py-4 text-center">Conversions</th>
                      <th className="px-6 py-4 text-center">Conversion Rate</th>
                      <th className="px-6 py-4 text-center">Avg HeatCheck</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {performanceMetrics.map((member) => {
                      const teamMember = teamMembers.find(tm => tm.member_name === member.team_member)
                      const isTopPerformer = member.team_member === topPerformer?.team_member
                      
                      return (
                        <tr 
                          key={member.team_member} 
                          className={cn(
                            "hover:bg-gray-50 transition-colors",
                            isTopPerformer && "bg-yellow-50"
                          )}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{member.team_member}</span>
                              {isTopPerformer && (
                                <Trophy className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{teamMember?.member_role || 'Unknown'}</td>
                          <td className="px-6 py-4 text-center font-medium">{member.total_calls}</td>
                          <td className="px-6 py-4 text-center">{member.appointment_calls}</td>
                          <td className="px-6 py-4 text-center">{member.price_presentations}</td>
                          <td className="px-6 py-4 text-center font-medium text-green-600">{member.converted_calls}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge 
                              className={cn(
                                "font-semibold",
                                getConversionRate(member) >= 30 
                                  ? "heatcheck-elite" 
                                  : getConversionRate(member) >= 15 
                                  ? "heatcheck-high"
                                  : "bg-gray-100 text-gray-700"
                              )}
                            >
                              {getConversionRate(member)}%
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Zap className="h-4 w-4 text-orange-500" />
                              <span className="font-medium">{getAvgHeatcheck(member)}</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              {performanceMetrics.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No performance metrics available</p>
                </div>
              )}
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h5 className="font-semibold text-blue-900 mb-2">Team Summary</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Team Calls:</span>
                    <span className="font-semibold text-blue-900">
                      {performanceMetrics.reduce((sum, m) => sum + m.total_calls, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Conversions:</span>
                    <span className="font-semibold text-blue-900">
                      {performanceMetrics.reduce((sum, m) => sum + m.converted_calls, 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h5 className="font-semibold text-green-900 mb-2">Best Performance</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Highest Conversion:</span>
                    <span className="font-semibold text-green-900">
                      {Math.max(...performanceMetrics.map(m => getConversionRate(m)), 0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Most Conversions:</span>
                    <span className="font-semibold text-green-900">
                      {Math.max(...performanceMetrics.map(m => m.converted_calls), 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                <h5 className="font-semibold text-orange-900 mb-2">Average Metrics</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-700">Avg HeatCheck:</span>
                    <span className="font-semibold text-orange-900">
                      {performanceMetrics.length > 0 
                        ? (performanceMetrics.reduce((sum, m) => sum + getAvgHeatcheck(m), 0) / performanceMetrics.length).toFixed(1)
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">Avg Calls/Member:</span>
                    <span className="font-semibold text-orange-900">
                      {performanceMetrics.length > 0 
                        ? Math.round(performanceMetrics.reduce((sum, m) => sum + m.total_calls, 0) / performanceMetrics.length)
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 