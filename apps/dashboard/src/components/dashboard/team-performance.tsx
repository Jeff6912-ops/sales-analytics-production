'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, TrendingUp, Phone, Target, Award, AlertCircle, RefreshCw } from 'lucide-react'

interface TeamMember {
  id: string
  member_name: string
  member_role: string
  common_phrases: string[]
  client_id: string
  created_at: string
}

interface TeamPerformanceMetrics {
  member_name: string
  appointment_calls: number
  presentations: number
  conversions: number
  conversion_rate: number
  avg_heatcheck: number
  total_calls: number
}

interface TeamPerformanceProps {
  clientId: string
}

export function TeamPerformance({ clientId }: TeamPerformanceProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<TeamPerformanceMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasTeamData, setHasTeamData] = useState(false)
  const [setupProgress, setSetupProgress] = useState(0)

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
        const checkResponse = await fetch(`/api/dummy-data/check?clientId=${clientId}`)
        
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
    const checkResponse = await fetch(`/api/dummy-data/check?clientId=${clientId}`)
    if (checkResponse.ok) {
      const checkData = await checkResponse.json()
      if (checkData.hasTeamData) {
        setHasTeamData(true)
        setTeamMembers(checkData.teamMembers || [])
        setPerformanceMetrics(checkData.performanceMetrics || [])
      }
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            4. Team Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-900">Error Loading Team Data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            4. Team Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            {setupProgress > 0 && (
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Setting up team data...</span>
                  <span>{setupProgress}%</span>
                </div>
                <Progress value={setupProgress} className="h-2" />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {setupProgress > 0 ? 'Creating team performance data...' : 'Loading team metrics...'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasTeamData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            4. Team Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Team Performance Ready</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Set up dummy team data to see performance metrics and test the dashboard features.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
              <h4 className="font-medium text-blue-900 mb-2">What will be created:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 3-6 team members with realistic roles</li>
                <li>• Call assignments based on common phrases</li>
                <li>• Performance metrics and conversion rates</li>
                <li>• Interactive team performance table</li>
              </ul>
            </div>
            
            <Button onClick={handleSetupTeamData} className="bg-blue-600 hover:bg-blue-700">
              <Target className="h-4 w-4 mr-2" />
              Setup Team Performance Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            4. Team Performance Summary
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Team Members</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Calls Assigned</p>
                <p className="text-2xl font-bold">
                  {performanceMetrics.reduce((sum, member) => sum + member.total_calls, 0)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Avg Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {performanceMetrics.length > 0 
                    ? Math.round(performanceMetrics.reduce((sum, member) => sum + member.conversion_rate, 0) / performanceMetrics.length)
                    : 0}%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Team Members</h4>
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{member.member_name}</p>
                    <p className="text-sm text-muted-foreground">{member.member_role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {performanceMetrics.find(m => m.member_name === member.member_name)?.total_calls || 0} calls
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {performanceMetrics.find(m => m.member_name === member.member_name)?.conversion_rate || 0}% conversion
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="detailed" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Team Member</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Total Calls</th>
                    <th className="text-left p-3 font-medium">Appointments</th>
                    <th className="text-left p-3 font-medium">Presentations</th>
                    <th className="text-left p-3 font-medium">Conversions</th>
                    <th className="text-left p-3 font-medium">Conversion Rate</th>
                    <th className="text-left p-3 font-medium">Avg HeatCheck</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceMetrics.map((member) => {
                    const teamMember = teamMembers.find(tm => tm.member_name === member.member_name)
                    return (
                      <tr key={member.member_name} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{member.member_name}</td>
                        <td className="p-3">{teamMember?.member_role || 'Unknown'}</td>
                        <td className="p-3">{member.total_calls}</td>
                        <td className="p-3">{member.appointment_calls}</td>
                        <td className="p-3">{member.presentations}</td>
                        <td className="p-3">{member.conversions}</td>
                        <td className="p-3">
                          <Badge 
                            variant={member.conversion_rate >= 30 ? "default" : member.conversion_rate >= 15 ? "secondary" : "outline"}
                          >
                            {member.conversion_rate}%
                          </Badge>
                        </td>
                        <td className="p-3">{member.avg_heatcheck}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {performanceMetrics.length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No performance metrics available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 