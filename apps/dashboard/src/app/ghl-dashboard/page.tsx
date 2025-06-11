'use client'

import { GHLAuthProvider } from '@/components/ghl/GHLAuthProvider'
import { GHLIframeOptimizer } from '@/components/ghl/GHLIframeOptimizer'
import { GHLDashboardClient } from '@/components/dashboard/ghl-dashboard-client'

// GHL-Integrated Dashboard Page
export default function GHLDashboardPage() {
  return (
    <GHLAuthProvider>
      <GHLIframeOptimizer>
        <GHLDashboardClient />
      </GHLIframeOptimizer>
    </GHLAuthProvider>
  )
} 