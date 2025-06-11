import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to calculate date ranges based on timeframe
function getDateRange(timeframe: string): { startDate: string; endDate: string } {
  const now = new Date()
  const endDate = now.toISOString()
  let startDate: Date

  switch (timeframe) {
    case 'daily':
      startDate = new Date(now)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'weekly':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case 'monthly':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
      break
    case 'custom':
      // For custom, we'll expect startDate and endDate params
      return { startDate: '', endDate: '' }
    default:
      // Default to weekly
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
  }

  return {
    startDate: startDate.toISOString(),
    endDate
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const timeframe = searchParams.get('timeframe') || 'weekly'
    const customStartDate = searchParams.get('startDate')
    const customEndDate = searchParams.get('endDate')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Calculate date range
    let dateRange = getDateRange(timeframe)
    
    // Override with custom dates if provided
    if (timeframe === 'custom' && customStartDate && customEndDate) {
      dateRange = {
        startDate: customStartDate,
        endDate: customEndDate
      }
    }

    const supabase = await createClient()

    // Set RLS context for this request
    await supabase.rpc('set_config', {
      setting_name: 'app.current_client_id',
      new_value: clientId,
      is_local: true
    })

    // Use the proper client-specific function with date filtering
    const { data: calls, error } = await supabase.rpc('get_client_call_messages', {
      p_client_id: clientId
    })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch calls' },
        { status: 500 }
      )
    }

    // Filter calls by date range if we have valid dates
    let filteredCalls = calls || []
    if (dateRange.startDate && dateRange.endDate) {
      const startTime = new Date(dateRange.startDate).getTime()
      const endTime = new Date(dateRange.endDate).getTime()
      
      filteredCalls = calls?.filter((call: any) => {
        if (!call.date_created) return false
        const callTime = new Date(call.date_created).getTime()
        return callTime >= startTime && callTime <= endTime
      }) || []
    }

    // Transform the calls data similar to the dashboard page
    const transformedCalls = filteredCalls?.map((call: any) => {
      // Extract HeatCheck with the exact format used: "HEATCHECK: 9/10"
      let heatCheck = 0
      if (call.analysis) {
        const patterns = [
          /HEATCHECK:\s*(\d+)\/?\d*/i,
          /HeatCheck Score:\s*(\d+)/i,
          /Score:\s*(\d+)/i,
          /heat\s*check\s*[:\-]?\s*(\d+)/i
        ]
        
        for (const pattern of patterns) {
          const match = call.analysis.match(pattern)
          if (match) {
            heatCheck = parseInt(match[1])
            break
          }
        }
      }
      
      // Extract top need/pain point
      let topNeed = 'Not specified'
      if (call.analysis) {
        const needsPatterns = [
          // New format patterns
          /TOP NEED\/PAIN POINT:\s*([^\n]+)/i,
          /TOP NEED:\s*([^\n]+)/i,
          /PAIN POINT:\s*([^\n]+)/i,
          
          // Old healthcare format patterns - more specific
          /PROSPECT'S NEEDS AND PAIN POINTS[^*]*\*\s*([^\n]+)/i,
          /NEEDS AND PAIN POINTS[^*]*\*\s*([^\n]+)/i,
          /PAIN POINTS[^*]*\*\s*([^\n]+)/i,
          
          // Generic patterns
          /PROSPECTS?\s+NEEDS?:\s*([\s\S]*?)(?:\n\n|OBJECTIONS?:|$)/i
        ]
        
        for (const pattern of needsPatterns) {
          const match = call.analysis.match(pattern)
          if (match) {
            if (pattern.source.includes('PROSPECTS')) {
              // Handle the old format with multiple lines
              const needs = match[1]
                .split('\n')
                .map((line: string) => line.replace(/^[\*\-\•]\s*/, '').trim())
                .filter((line: string) => line.length > 0)
                .slice(0, 1) // Take first need only
              
              if (needs.length > 0) {
                topNeed = needs[0]
                break
              }
            } else {
              // Direct match from single line patterns
              const cleanNeed = match[1].trim()
              if (cleanNeed && cleanNeed.length > 3) {
                topNeed = cleanNeed
                break
              }
            }
          }
        }
      }

      // Extract main objection
      let objection = 'None identified'
      if (call.analysis) {
        const objectionPatterns = [
          // New format patterns
          /MAIN OBJECTION:\s*([^\n]+)/i,
          /OBJECTIONS?:\s*([^\n]+)/i,
          
          // Old healthcare format patterns - more specific
          /OBJECTIONS RAISED AND HANDLING[^*]*\*\s*([^\n]+)/i,
          /OBJECTIONS? AND CONCERNS[^*]*\*\s*([^\n]+)/i,
          /OBJECTIONS?[^*]*\*\s*([^\n]+)/i,
          
          // Generic patterns
          /OBJECTIONS?:\s*\n?\*?\s*([^\n*]+)/i
        ]
        
        for (const pattern of objectionPatterns) {
          const match = call.analysis.match(pattern)
          if (match) {
            const objectionText = match[1].trim()
            if (objectionText && objectionText.length > 3 && 
                !objectionText.toLowerCase().includes('no significant') &&
                !objectionText.toLowerCase().includes('none identified')) {
              objection = objectionText
              break
            }
          }
        }
      }
      
      // Extract call outcome
      let outcome = 'Not specified'
      if (call.analysis) {
        const outcomePatterns = [
          // New format patterns
          /CALL OUTCOME:\s*([^\n]+)/i,
          /OUTCOME:\s*([^\n]+)/i,
          
          // Old healthcare format patterns - standalone OUTCOME section
          /\nOUTCOME\s*\n\s*([^\n]+)/i,
          /\nOUTCOME\s*\n\n([^\n]+)/i,
          
          // More specific patterns
          /CALL\s+OUTCOME[^:]*:\s*\n\s*\*\s*([^\n]+)/i,
          /NEXT\s+STEPS[^:]*:\s*\n\s*\*\s*([^\n]+)/i,
          /FOLLOW[^:]*UP[^:]*:\s*\n\s*\*\s*([^\n]+)/i,
          
          // Look for outcome-like content at the end
          /(?:RESULT|CONCLUSION|STATUS)[^:]*:\s*([^\n]+)/i
        ]
        
        for (const pattern of outcomePatterns) {
          const match = call.analysis.match(pattern)
          if (match) {
            const outcomeText = match[1].trim()
            if (outcomeText && outcomeText.length > 3) {
              outcome = outcomeText
              break
            }
          }
        }
      }

      return {
        ...call,
        prospect_name: call.contact_name || 'Unknown Prospect',
        heatcheck_score: heatCheck,
        top_need_pain_point: topNeed,
        main_objection: objection,
        call_outcome: outcome
      }
    }) || []

    console.log(`📊 Date filtering applied:`, {
      timeframe,
      dateRange,
      totalCalls: calls?.length || 0,
      filteredCalls: transformedCalls.length,
      clientId
    })

    return NextResponse.json(transformedCalls)

  } catch (error) {
    console.error('💥 API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 