# 🚀 Phase 1: Foundation & GHL Integration Setup
## Days 1-3 | Dashboard Project Foundation

**Goal**: Set up the complete foundation for the sales call dashboard including Next.js project, Supabase integration, GHL authentication, and mock data setup.

**Duration**: 3 Days  
**Complexity**: Medium (5/10)  
**Prerequisites**: Context7 MCP and Supabase MCP configured in your environment

---

## 📋 **Phase 1 Overview**

### What We'll Build
- ✅ Next.js 15 project with proper structure
- ✅ Supabase database connection and mock data
- ✅ GHL iframe integration with PostMessage API
- ✅ Authentication flow and client context detection
- ✅ Basic dashboard shell with real data
- ✅ Dummy team data for testing

### Key Technical Focus
- **Production data integration** using existing Supabase database (`gktdkjeflginpvgsndyy.supabase.co`)
- **Database schema validation** using @database_schema.md specifications
- **Context7 MCP integration** for rapid development and best practices
- **GHL authentication** with official PostMessage API patterns
- **Multi-tenant security** leveraging existing RLS policies

### Success Criteria
- [ ] Dashboard loads real production data within 2 seconds
- [ ] GHL iframe integration working with context detection
- [ ] All database queries validated against @database_schema.md
- [ ] Dummy team data properly integrated for Phase 2 development
- [ ] Authentication flow tested with multiple client contexts

---

## 🎯 **DAY 1: Project Foundation & Database Integration**

### **🎯 Task 1.1: Context7 MCP Project Setup**
**Time Estimate**: 2-3 hours | **Priority**: Critical | **Complexity**: 5/10

#### **Context & Requirements**
Use Context7 MCP to rapidly set up Next.js 15 project with proper TypeScript, shadcn/ui integration, and Supabase connectivity. This approach leverages AI assistance for best practices and reduces setup time from hours to minutes.

#### **Context7 MCP Queries - Project Foundation**
Execute these MCP queries in sequence for optimal project setup:

##### **MCP Query 1.1.1: Next.js 15 Project Setup**
```
**Context7 MCP Query:**
"Next.js 15 App Router project setup with TypeScript and shadcn/ui for sales dashboard application. Include:
- Latest App Router patterns with React 19
- TypeScript configuration optimized for dashboard development  
- shadcn/ui integration with Card, Table, Button, Input, Select components
- Tailwind CSS configuration for responsive design
- Project structure for dashboard, authentication, and API routes
- Environment configuration for Supabase integration
- Package.json with production-ready dependencies"

**Expected Output**: Complete project scaffolding with modern Next.js patterns
**Validation Criteria**: 
- TypeScript compiles without errors
- shadcn/ui components render correctly
- Tailwind CSS classes apply properly
- Environment variables load successfully
```

##### **MCP Query 1.1.2: Supabase Authentication Integration**
```
**Context7 MCP Query:**
"Supabase authentication integration patterns for Next.js 15 App Router with multi-tenant support. Include:
- @supabase/ssr package configuration for server components
- Client and server-side Supabase client creation
- Middleware for authentication and RLS context
- Multi-tenant authentication with client_id context
- TypeScript types for authentication and user sessions
- Error handling for authentication failures"

**Expected Output**: Production-ready authentication patterns
**Validation Criteria**:
- Server and client Supabase clients work correctly
- Middleware handles authentication flow
- RLS context properly set for multi-tenant access
- TypeScript types complete and accurate
```

##### **MCP Query 1.1.3: Dashboard Layout Components**
```
**Context7 MCP Query:**
"Dashboard layout components using shadcn/ui for sales call analytics. Include:
- Responsive dashboard shell with header, sidebar, main content
- Performance metrics cards with loading states
- Interactive data table with sorting, filtering, pagination
- Chart components integration with Recharts
- Mobile-responsive navigation and layouts
- Typography and spacing following dashboard design patterns"

**Expected Output**: Complete dashboard component library
**Validation Criteria**:
- All layout components responsive across devices
- Loading states and error boundaries functional
- Chart components integrate with data properly
- Navigation works seamlessly on mobile and desktop
```

##### **MCP Query 1.1.4: TypeScript Types and Data Structures**
```
**Context7 MCP Query:**
"TypeScript type definitions for sales call dashboard application. Include:
- Call data interfaces matching database schema
- Dashboard filter and query types
- Authentication and user context types
- API response and error types
- Export function parameter types
- Real-time subscription data types"

**Expected Output**: Comprehensive TypeScript type library
**Validation Criteria**:
- All components compile without type errors
- Database queries have proper type safety
- API responses properly typed
- Import/export statements work correctly
```

#### **Step-by-Step Implementation**

##### **1.1.1: Initialize Project with Context7 MCP**
```bash
# Execute Context7 MCP Query 1.1.1
# Create new Next.js 15 project
npx create-next-app@latest sales-dashboard --typescript --tailwind --eslint --app --src-dir

cd sales-dashboard

# Install shadcn/ui following MCP guidance
npx shadcn-ui@latest init
npx shadcn-ui@latest add card table button input select badge progress
```

##### **1.1.2: Configure Environment Variables**
Create `.env.local` based on MCP authentication patterns:
```bash
# Supabase Configuration (Production Database)
NEXT_PUBLIC_SUPABASE_URL=https://gktdkjeflginpvgsndyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Get from Supabase MCP]
SUPABASE_SERVICE_ROLE_KEY=[Get from Supabase MCP]

# GHL Integration
NEXT_PUBLIC_GHL_APP_ID=[TBD in later tasks]
GHL_CLIENT_SECRET=[TBD in later tasks]

# Development
NODE_ENV=development
```

##### **1.1.3: Create Supabase Client Configuration**
Use Context7 MCP patterns to create authentication:

```typescript
// utils/supabase/server.ts - Based on MCP Query 1.1.2
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component limitation - handled by middleware
          }
        }
      }
    }
  )
}
```

#### **Deliverables**
- [ ] Next.js 15 project initialized with TypeScript and shadcn/ui
- [ ] Supabase client configuration following MCP best practices
- [ ] Environment variables configured for production database
- [ ] Basic dashboard layout components created

---

### **🎯 Task 1.2: Database Schema Validation & Integration**
**Time Estimate**: 2-3 hours | **Priority**: Critical | **Complexity**: 6/10

#### **Context & Requirements**
Validate dashboard requirements against the production database schema documented in @database_schema.md. Ensure all required fields exist and create validation queries for each dashboard feature.

#### **Supabase MCP Queries - Database Validation**

##### **MCP Query 1.2.1: Production Database Structure Validation**
```
**Supabase MCP Query:**
"Validate existing call_messages table structure and sample data for dashboard requirements. Include:
- Table schema with all columns and data types
- Sample data showing HeatCheck scores, prospect names, call outcomes
- Validation of required dashboard fields: heatcheck_score, top_need_pain_point, main_objection, call_outcome, prospect_name, call_date
- Row Level Security policies for multi-tenant access
- Performance analysis of existing indexes"

**Expected Output**: Complete database structure validation
**Validation Criteria**:
- All required dashboard fields exist and populated
- Data types match TypeScript interface requirements
- RLS policies correctly filter by client_id
- Sample data demonstrates realistic call analysis results
```

##### **MCP Query 1.2.2: Dashboard Views and Functions**
```
**Supabase MCP Query:**
"Check dashboard_call_data_with_team view and get_team_performance_metrics function. Include:
- View definition and column structure
- Function parameters and return types  
- Sample queries for dashboard data retrieval
- Performance characteristics for realistic data volumes
- Team assignment integration patterns"

**Expected Output**: Complete view and function documentation
**Validation Criteria**:
- dashboard_call_data_with_team view returns expected columns
- get_team_performance_metrics function accepts correct parameters
- Sample queries return realistic performance data
- Query performance meets <500ms target for 525 calls
```

##### **MCP Query 1.2.3: Client Configuration Validation**
```
**Supabase MCP Query:**
"Validate clients table structure for GHL integration. Include:
- Client table schema with ghl_location_id mapping
- Sample client configurations and industry data
- RLS policies for client-specific data access
- LocationId to clientId mapping validation
- Multi-tenant isolation verification"

**Expected Output**: Client configuration validation complete
**Validation Criteria**:
- All active clients have ghl_location_id mappings
- Client industry data properly categorized
- RLS policies enforce proper data isolation
- LocationId mapping function works correctly
```

#### **Database Schema Validation Scripts**

Create `scripts/validate-database.sql`:
```sql
-- Validation Script 1: Required Dashboard Fields
-- Purpose: Verify all fields needed for dashboard exist and have data
SELECT 
  COUNT(*) as total_calls,
  COUNT(heatcheck_score) as calls_with_heatcheck,
  COUNT(top_need_pain_point) as calls_with_needs,
  COUNT(main_objection) as calls_with_objections,
  COUNT(call_outcome) as calls_with_outcomes,
  COUNT(prospect_name) as calls_with_prospects,
  ROUND(COUNT(heatcheck_score) * 100.0 / COUNT(*), 1) as heatcheck_completion,
  ROUND(COUNT(top_need_pain_point) * 100.0 / COUNT(*), 1) as needs_completion,
  ROUND(COUNT(main_objection) * 100.0 / COUNT(*), 1) as objections_completion
FROM call_messages 
WHERE client_id = 'test-client-1' 
  AND created_at >= NOW() - INTERVAL '7 days';

-- Validation Script 2: Team Performance Data Quality
-- Purpose: Validate team assignment and performance calculation readiness
SELECT 
  client_id,
  COUNT(*) as total_calls,
  COUNT(team_member_id) as assigned_calls,
  ROUND(COUNT(team_member_id) * 100.0 / COUNT(*), 1) as assignment_rate,
  AVG(heatcheck_score) as avg_score,
  COUNT(CASE WHEN call_outcome LIKE '%converted%' THEN 1 END) as conversions
FROM dashboard_call_data_with_team
WHERE client_id = 'test-client-1'
  AND call_date >= NOW() - INTERVAL '30 days'
GROUP BY client_id;

-- Validation Script 3: Performance Index Testing
-- Purpose: Ensure queries perform within acceptable limits
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM dashboard_call_data_with_team 
WHERE client_id = 'test-client-1' 
  AND call_date >= NOW() - INTERVAL '7 days'
ORDER BY call_date DESC 
LIMIT 100;

-- Validation Script 4: RLS Policy Testing
-- Purpose: Verify multi-tenant data isolation works correctly
SET rls.client_id = 'test-client-1';
SELECT COUNT(*) as client_1_calls FROM call_messages;

SET rls.client_id = 'test-client-2';  
SELECT COUNT(*) as client_2_calls FROM call_messages;

-- Should return different counts, proving isolation works

-- Validation Script 5: Function Performance Testing
-- Purpose: Test team performance function with realistic data volumes
SELECT 
  p_client_id,
  COUNT(*) as metrics_count,
  AVG(total_calls) as avg_calls_per_member,
  SUM(total_calls) as total_team_calls
FROM get_team_performance_metrics(
  'test-client-1',
  (NOW() - INTERVAL '30 days')::date,
  NOW()::date
) 
GROUP BY p_client_id;
```

Create `utils/database-validation.ts`:
```typescript
import { createClient } from '@/utils/supabase/server';

interface DatabaseValidationResult {
  fieldsValid: boolean;
  teamPerformanceValid: boolean;
  rlsValid: boolean;
  performanceValid: boolean;
  completionRates: {
    heatcheck: number;
    needs: number;
    objections: number;
    outcomes: number;
  };
  timestamp: string;
  errors: string[];
}

export async function validateDatabaseSchema(): Promise<DatabaseValidationResult> {
  const supabase = await createClient();
  const errors: string[] = [];
  let fieldsValid = false;
  let teamPerformanceValid = false;
  let rlsValid = false;
  let performanceValid = false;
  let completionRates = { heatcheck: 0, needs: 0, objections: 0, outcomes: 0 };

  try {
    // Test 1: Validate required dashboard fields exist and have data
    const { data: fieldData, error: fieldError } = await supabase
      .from('call_messages')
      .select(`
        id,
        heatcheck_score,
        top_need_pain_point,
        main_objection,
        call_outcome,
        prospect_name,
        call_date
      `)
      .limit(100);
      
    if (fieldError) {
      errors.push(`Field validation failed: ${fieldError.message}`);
    } else if (fieldData && fieldData.length > 0) {
      // Calculate completion rates for dashboard fields
      const total = fieldData.length;
      completionRates = {
        heatcheck: (fieldData.filter(r => r.heatcheck_score).length / total) * 100,
        needs: (fieldData.filter(r => r.top_need_pain_point).length / total) * 100,
        objections: (fieldData.filter(r => r.main_objection).length / total) * 100,
        outcomes: (fieldData.filter(r => r.call_outcome).length / total) * 100
      };
      
      // Consider valid if at least 70% completion rate
      fieldsValid = Object.values(completionRates).every(rate => rate >= 70);
      
      if (!fieldsValid) {
        errors.push(`Low completion rates: ${JSON.stringify(completionRates)}`);
      }
    }
    
    // Test 2: Validate team performance function and view
    const { data: teamData, error: teamError } = await supabase
      .rpc('get_team_performance_metrics', {
        p_client_id: 'test-client-1',
        p_start_date: '2024-12-01',
        p_end_date: '2024-12-31'
      });
      
    if (teamError) {
      errors.push(`Team performance validation failed: ${teamError.message}`);
    } else {
      teamPerformanceValid = true;
    }
    
    // Test 3: Validate dashboard view works
    const { data: viewData, error: viewError } = await supabase
      .from('dashboard_call_data_with_team')
      .select('*')
      .limit(10);
      
    if (viewError) {
      errors.push(`Dashboard view validation failed: ${viewError.message}`);
    }
    
    // Test 4: Validate RLS policies (basic test)
    const { data: rlsData, error: rlsError } = await supabase
      .from('call_messages')
      .select('client_id')
      .limit(5);
      
    if (rlsError) {
      errors.push(`RLS validation failed: ${rlsError.message}`);
    } else {
      rlsValid = true;
    }
    
    // Test 5: Performance validation (basic query timing)
    const startTime = Date.now();
    const { data: perfData, error: perfError } = await supabase
      .from('dashboard_call_data_with_team')
      .select('*')
      .order('call_date', { ascending: false })
      .limit(100);
    const queryTime = Date.now() - startTime;
    
    if (perfError) {
      errors.push(`Performance validation failed: ${perfError.message}`);
    } else {
      performanceValid = queryTime < 2000; // 2 second target
      if (!performanceValid) {
        errors.push(`Query too slow: ${queryTime}ms (target: <2000ms)`);
      }
    }
    
  } catch (error) {
    errors.push(`Database validation exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    fieldsValid,
    teamPerformanceValid,
    rlsValid,
    performanceValid,
    completionRates,
    timestamp: new Date().toISOString(),
    errors
  };
}

export async function validateProductionDataAccess() {
  const supabase = await createClient();
  
  try {
    // Test connection to production database
    const { data, error } = await supabase
      .from('clients')
      .select('client_id, business_name, ghl_location_id')
      .limit(5);
      
    if (error) {
      throw new Error(`Production database access failed: ${error.message}`);
    }
    
    // Validate we have active clients with GHL integration
    const activeClients = data?.filter(client => client.ghl_location_id);
    
    return {
      connected: true,
      totalClients: data?.length || 0,
      activeGHLClients: activeClients?.length || 0,
      sampleClients: data?.map(c => ({ 
        id: c.client_id, 
        name: c.business_name,
        hasGHL: !!c.ghl_location_id 
      })) || []
    };
    
  } catch (error) {
    throw new Error(`Production validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

Create `components/database/ValidationDashboard.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { validateDatabaseSchema, validateProductionDataAccess } from '@/utils/database-validation';

export function DatabaseValidationDashboard() {
  const [validationResult, setValidationResult] = useState(null);
  const [productionAccess, setProductionAccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const runValidation = async () => {
    setLoading(true);
    try {
      const [dbResult, prodResult] = await Promise.all([
        validateDatabaseSchema(),
        validateProductionDataAccess()
      ]);
      
      setValidationResult(dbResult);
      setProductionAccess(prodResult);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (valid: boolean) => {
    return valid ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getCompletionBadge = (rate: number) => {
    if (rate >= 90) return <Badge variant="default">Excellent ({rate.toFixed(1)}%)</Badge>;
    if (rate >= 70) return <Badge variant="secondary">Good ({rate.toFixed(1)}%)</Badge>;
    return <Badge variant="destructive">Poor ({rate.toFixed(1)}%)</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Database Schema Validation
            <Button onClick={runValidation} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run Validation'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validationResult ? (
            <div className="space-y-4">
              {/* Validation Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(validationResult.fieldsValid)}
                  <span className="text-sm">Required Fields</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(validationResult.teamPerformanceValid)}
                  <span className="text-sm">Team Performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(validationResult.rlsValid)}
                  <span className="text-sm">RLS Policies</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(validationResult.performanceValid)}
                  <span className="text-sm">Query Performance</span>
                </div>
              </div>

              {/* Completion Rates */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Data Completion Rates</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">HeatCheck:</span>
                    {getCompletionBadge(validationResult.completionRates.heatcheck)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Needs:</span>
                    {getCompletionBadge(validationResult.completionRates.needs)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Objections:</span>
                    {getCompletionBadge(validationResult.completionRates.objections)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Outcomes:</span>
                    {getCompletionBadge(validationResult.completionRates.outcomes)}
                  </div>
                </div>
              </div>

              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Validation Issues:</p>
                      <ul className="text-sm list-disc list-inside">
                        {validationResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click "Run Validation" to check database schema and data quality
            </p>
          )}
        </CardContent>
      </Card>

      {/* Production Access Status */}
      {productionAccess && (
        <Card>
          <CardHeader>
            <CardTitle>Production Database Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Connection Status:</span>
                <Badge variant={productionAccess.connected ? "default" : "destructive"}>
                  {productionAccess.connected ? "Connected" : "Failed"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Clients:</span>
                <Badge variant="outline">{productionAccess.totalClients}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>GHL Integrated:</span>
                <Badge variant="outline">{productionAccess.activeGHLClients}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

#### **Deliverables**
- [ ] Database schema validated against @database_schema.md requirements
- [ ] Dashboard data access layer created with production queries
- [ ] All required fields confirmed available in production database
- [ ] Sample data retrieval tested with real client data

---

### **🎯 Task 1.3: Dummy Team Data Setup Strategy**
**Time Estimate**: 2 hours | **Priority**: Critical | **Complexity**: 4/10

#### **Context & Requirements**
Set up realistic dummy team data for dashboard development and testing. This enables full team performance feature development without waiting for production team integration via n8n workflows.

#### **Dummy Team Data Strategy**

##### **Phase Approach**
```javascript
const teamDataStrategy = {
  developmentPhase: {
    approach: 'Dummy team data for UI development',
    scope: 'Dashboard components and testing only',
    integration: 'Use existing database tables and functions',
    dataSource: 'Manually created realistic team members'
  },
  
  productionPhase: {
    approach: 'Real team data via GHL onboarding forms',
    scope: 'Automated team roster collection and call assignment',
    integration: 'n8n workflows handle team data processing',
    dataSource: 'Client onboarding forms and team roster updates'
  },
  
  dashboardScope: {
    focus: 'UI components for displaying team performance',
    dataAccess: 'Query existing dashboard_call_data_with_team view',
    testing: 'Dummy team data for realistic dashboard development',
    noApiDevelopment: 'Team integration handled by n8n, not dashboard'
  }
};
```

#### **Step-by-Step Dummy Data Setup**

##### **1.3.1: Create Dummy Team Members**
Create `scripts/setup-dummy-team-data.sql`:
```sql
-- Script: setup-dummy-team-data.sql
-- Purpose: Create realistic dummy team members for dashboard development

-- Client 1: KLINICS (Healthcare - 5 team members)
INSERT INTO team_members (client_id, member_name, member_role, common_phrases, created_at) VALUES
  ('klinics-test', 'Dr. Sarah Johnson', 'Lead Physician', ARRAY['Dr. Johnson here', 'Sarah speaking', 'This is Sarah'], NOW()),
  ('klinics-test', 'Mike Chen', 'Patient Coordinator', ARRAY['Hey there', 'Mike here', 'Mike speaking'], NOW()),
  ('klinics-test', 'Lisa Rodriguez', 'Insurance Specialist', ARRAY['Lisa here', 'Good morning', 'This is Lisa'], NOW()),
  ('klinics-test', 'David Park', 'Scheduling Coordinator', ARRAY['David speaking', 'Hi, David here', 'David from'], NOW()),
  ('klinics-test', 'Amanda Foster', 'Nurse Practitioner', ARRAY['Amanda here', 'Nurse Amanda', 'This is Amanda'], NOW());

-- Client 2: REALTY_CO (Real Estate - 4 team members)  
INSERT INTO team_members (client_id, member_name, member_role, common_phrases, created_at) VALUES
  ('realty-co-test', 'Jennifer Thompson', 'Senior Agent', ARRAY['Jennifer here', 'Jen speaking', 'This is Jennifer'], NOW()),
  ('realty-co-test', 'Carlos Martinez', 'Lead Agent', ARRAY['Carlos here', 'Hey, Carlos', 'Carlos speaking'], NOW()),
  ('realty-co-test', 'Ashley Williams', 'Buyer Specialist', ARRAY['Ashley here', 'Hi, Ashley', 'This is Ashley'], NOW()),
  ('realty-co-test', 'Robert Kim', 'Listing Agent', ARRAY['Robert here', 'Bob speaking', 'This is Robert'], NOW());

-- Client 3: TECH_SAAS (Technology - 6 team members)
INSERT INTO team_members (client_id, member_name, member_role, common_phrases, created_at) VALUES  
  ('tech-saas-test', 'Alex Chen', 'Sales Manager', ARRAY['Alex here', 'Hey, Alex', 'This is Alex'], NOW()),
  ('tech-saas-test', 'Priya Patel', 'Account Executive', ARRAY['Priya speaking', 'Hi, Priya', 'Priya here'], NOW()),
  ('tech-saas-test', 'Jordan Taylor', 'SDR', ARRAY['Jordan here', 'Hey there', 'Jordan speaking'], NOW()),
  ('tech-saas-test', 'Sam Wilson', 'Senior AE', ARRAY['Sam here', 'Hi, Sam', 'Sam Wilson'], NOW()),
  ('tech-saas-test', 'Maria Santos', 'Customer Success', ARRAY['Maria here', 'Hi, Maria', 'This is Maria'], NOW()),
  ('tech-saas-test', 'Chris Brown', 'Solution Engineer', ARRAY['Chris here', 'Hey, Chris', 'Chris speaking'], NOW());

-- Verify team member creation
SELECT 
  client_id,
  COUNT(*) as team_member_count,
  STRING_AGG(member_name, ', ') as team_members
FROM team_members 
WHERE client_id IN ('klinics-test', 'realty-co-test', 'tech-saas-test')
GROUP BY client_id;
```

##### **1.3.2: Bulk Assignment of Historical Calls**
Create `scripts/assign-dummy-team-calls.sql`:
```sql
-- Script: assign-dummy-team-calls.sql
-- Purpose: Assign historical calls to dummy team members using existing functions

-- Assign calls for KLINICS (realistic healthcare call patterns)
SELECT bulk_assign_sales_reps('klinics-test');

-- Assign calls for REALTY_CO (realistic real estate call patterns)  
SELECT bulk_assign_sales_reps('realty-co-test');

-- Assign calls for TECH_SAAS (realistic SaaS call patterns)
SELECT bulk_assign_sales_reps('tech-saas-test');

-- Validate assignments
SELECT 
  client_id,
  COUNT(*) as total_calls,
  COUNT(team_member_id) as assigned_calls,
  ROUND(COUNT(team_member_id) * 100.0 / COUNT(*), 1) as assignment_rate,
  AVG(heatcheck_score) as avg_heatcheck_score
FROM dashboard_call_data_with_team
WHERE client_id IN ('klinics-test', 'realty-co-test', 'tech-saas-test')
  AND call_date >= NOW() - INTERVAL '30 days'
GROUP BY client_id
ORDER BY client_id;

-- Validate realistic performance distribution per team member
SELECT 
  client_id,
  team_member_name,
  team_member_role,
  COUNT(*) as total_calls,
  AVG(heatcheck_score) as avg_heatcheck,
  COUNT(CASE WHEN call_outcome LIKE '%converted%' OR call_outcome LIKE '%closed%' THEN 1 END) as conversions,
  ROUND(COUNT(CASE WHEN call_outcome LIKE '%converted%' OR call_outcome LIKE '%closed%' THEN 1 END) * 100.0 / COUNT(*), 1) as conversion_rate
FROM dashboard_call_data_with_team
WHERE client_id IN ('klinics-test', 'realty-co-test', 'tech-saas-test')
  AND call_date >= NOW() - INTERVAL '30 days'
  AND team_member_id IS NOT NULL
GROUP BY client_id, team_member_name, team_member_role
ORDER BY client_id, total_calls DESC;
```

##### **1.3.3: Team Performance Validation**
Create `scripts/validate-team-performance.sql`:
```sql
-- Script: validate-team-performance.sql
-- Purpose: Validate team performance calculations work with dummy data

-- Test team performance metrics function for each test client
SELECT 'KLINICS Test Results' as test_client;
SELECT * FROM get_team_performance_metrics(
  'klinics-test',
  '2024-12-01'::date,
  '2024-12-31'::date
);

SELECT 'REALTY_CO Test Results' as test_client;
SELECT * FROM get_team_performance_metrics(
  'realty-co-test',
  '2024-12-01'::date,
  '2024-12-31'::date
);

SELECT 'TECH_SAAS Test Results' as test_client;
SELECT * FROM get_team_performance_metrics(
  'tech-saas-test',
  '2024-12-01'::date,
  '2024-12-31'::date
);

-- Validate realistic performance distribution
SELECT 
  tm.client_id,
  tm.member_name,
  tm.member_role,
  COUNT(c.id) as total_calls,
  AVG(c.heatcheck_score) as avg_heatcheck,
  COUNT(CASE WHEN c.call_outcome LIKE '%converted%' THEN 1 END) as conversions,
  COUNT(CASE WHEN c.call_outcome LIKE '%presentation%' THEN 1 END) as presentations,
  COUNT(CASE WHEN c.call_outcome LIKE '%appointment%' THEN 1 END) as appointments
FROM team_members tm
LEFT JOIN call_team_assignments cta ON tm.id = cta.team_member_id
LEFT JOIN call_messages c ON cta.call_id = c.id
WHERE tm.client_id IN ('klinics-test', 'realty-co-test', 'tech-saas-test')
  AND c.created_at >= NOW() - INTERVAL '30 days'
GROUP BY tm.client_id, tm.id, tm.member_name, tm.member_role
ORDER BY tm.client_id, total_calls DESC;
```

#### **Integration with Dashboard Components**

Create `utils/dummy-data-helpers.ts`:
```typescript
import { createClient } from '@/utils/supabase/server';

interface DummyDataSetupResult {
  success: boolean;
  clientsSetup: string[];
  teamMembersCreated: number;
  callsAssigned: number;
  errors: string[];
}

export async function setupDummyTeamData(): Promise<DummyDataSetupResult> {
  const supabase = await createClient();
  const errors: string[] = [];
  let teamMembersCreated = 0;
  let callsAssigned = 0;
  const clientsSetup: string[] = [];
  
  try {
    // Check if dummy data already exists
    const { data: existingTeams } = await supabase
      .from('team_members')
      .select('client_id')
      .in('client_id', ['klinics-test', 'realty-co-test', 'tech-saas-test']);
      
    if (existingTeams && existingTeams.length > 0) {
      return {
        success: true,
        clientsSetup: [],
        teamMembersCreated: 0,
        callsAssigned: 0,
        errors: ['Dummy team data already exists']
      };
    }
    
    // Setup dummy team members for each test client
    const dummyTeamData = [
      // KLINICS Healthcare team
      {
        client_id: 'klinics-test',
        members: [
          { name: 'Dr. Sarah Johnson', role: 'Lead Physician', phrases: ['Dr. Johnson here', 'Sarah speaking', 'This is Sarah'] },
          { name: 'Mike Chen', role: 'Patient Coordinator', phrases: ['Hey there', 'Mike here', 'Mike speaking'] },
          { name: 'Lisa Rodriguez', role: 'Insurance Specialist', phrases: ['Lisa here', 'Good morning', 'This is Lisa'] },
          { name: 'David Park', role: 'Scheduling Coordinator', phrases: ['David speaking', 'Hi, David here', 'David from'] },
          { name: 'Amanda Foster', role: 'Nurse Practitioner', phrases: ['Amanda here', 'Nurse Amanda', 'This is Amanda'] }
        ]
      },
      // REALTY_CO Real Estate team  
      {
        client_id: 'realty-co-test',
        members: [
          { name: 'Jennifer Thompson', role: 'Senior Agent', phrases: ['Jennifer here', 'Jen speaking', 'This is Jennifer'] },
          { name: 'Carlos Martinez', role: 'Lead Agent', phrases: ['Carlos here', 'Hey, Carlos', 'Carlos speaking'] },
          { name: 'Ashley Williams', role: 'Buyer Specialist', phrases: ['Ashley here', 'Hi, Ashley', 'This is Ashley'] },
          { name: 'Robert Kim', role: 'Listing Agent', phrases: ['Robert here', 'Bob speaking', 'This is Robert'] }
        ]
      },
      // TECH_SAAS Technology team
      {
        client_id: 'tech-saas-test',
        members: [
          { name: 'Alex Chen', role: 'Sales Manager', phrases: ['Alex here', 'Hey, Alex', 'This is Alex'] },
          { name: 'Priya Patel', role: 'Account Executive', phrases: ['Priya speaking', 'Hi, Priya', 'Priya here'] },
          { name: 'Jordan Taylor', role: 'SDR', phrases: ['Jordan here', 'Hey there', 'Jordan speaking'] },
          { name: 'Sam Wilson', role: 'Senior AE', phrases: ['Sam here', 'Hi, Sam', 'Sam Wilson'] },
          { name: 'Maria Santos', role: 'Customer Success', phrases: ['Maria here', 'Hi, Maria', 'This is Maria'] },
          { name: 'Chris Brown', role: 'Solution Engineer', phrases: ['Chris here', 'Hey, Chris', 'Chris speaking'] }
        ]
      }
    ];
    
    // Create team members for each client
    for (const clientData of dummyTeamData) {
      for (const member of clientData.members) {
        const { error } = await supabase
          .from('team_members')
          .insert({
            client_id: clientData.client_id,
            member_name: member.name,
            member_role: member.role,
            common_phrases: member.phrases,
            created_at: new Date().toISOString()
          });
          
        if (error) {
          errors.push(`Failed to create ${member.name}: ${error.message}`);
        } else {
          teamMembersCreated++;
        }
      }
      
      // Run bulk assignment for this client
      const { data: assignmentResult, error: assignmentError } = await supabase
        .rpc('bulk_assign_sales_reps', { p_client_id: clientData.client_id });
        
      if (assignmentError) {
        errors.push(`Failed to assign calls for ${clientData.client_id}: ${assignmentError.message}`);
      } else {
        clientsSetup.push(clientData.client_id);
        // Count how many calls were assigned (approximate)
        const { count } = await supabase
          .from('dashboard_call_data_with_team')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientData.client_id)
          .not('team_member_id', 'is', null);
        callsAssigned += count || 0;
      }
    }
    
  } catch (error) {
    errors.push(`Setup exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    success: errors.length === 0 || (teamMembersCreated > 0 && clientsSetup.length > 0),
    clientsSetup,
    teamMembersCreated,
    callsAssigned,
    errors
  };
}

export async function validateTeamPerformance(clientId: string) {
  const supabase = await createClient();
  
  try {
    // Get team performance metrics for the client
    const { data: metrics, error } = await supabase
      .rpc('get_team_performance_metrics', {
        p_client_id: clientId,
        p_start_date: '2024-12-01',
        p_end_date: '2024-12-31'
      });
      
    if (error) {
      throw new Error(`Team performance validation failed: ${error.message}`);
    }
    
    // Get team member count
    const { count: teamCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId);
      
    // Check assignment quality
    const { data: assignmentStats } = await supabase
      .from('dashboard_call_data_with_team')
      .select('team_member_id')
      .eq('client_id', clientId)
      .gte('call_date', '2024-12-01');
      
    const totalCalls = assignmentStats?.length || 0;
    const assignedCalls = assignmentStats?.filter(s => s.team_member_id).length || 0;
    
    return {
      metricsCalculated: metrics && metrics.length > 0,
      teamMemberCount: teamCount || 0,
      performanceMetrics: metrics || [],
      hasRealisticData: metrics?.some(m => m.total_calls > 0) || false,
      assignmentStats: {
        totalCalls,
        assignedCalls,
        assignmentRate: totalCalls > 0 ? (assignedCalls / totalCalls) * 100 : 0
      }
    };
    
  } catch (error) {
    throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getDummyTeamClients() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('team_members')
    .select('client_id')
    .in('client_id', ['klinics-test', 'realty-co-test', 'tech-saas-test'])
    .limit(1);
    
  return {
    hasDummyData: !error && data && data.length > 0,
    availableClients: ['klinics-test', 'realty-co-test', 'tech-saas-test']
  };
}
```

#### **Team Performance UI Integration**

Create `components/dashboard/TeamPerformanceDemo.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Loader2, Users, TrendingUp } from 'lucide-react';
import { setupDummyTeamData, validateTeamPerformance, getDummyTeamClients } from '@/utils/dummy-data-helpers';

export function TeamPerformanceDemo() {
  const [setupResult, setSetupResult] = useState(null);
  const [validationResults, setValidationResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasDummyData, setHasDummyData] = useState(false);

  useEffect(() => {
    checkDummyDataExists();
  }, []);

  const checkDummyDataExists = async () => {
    try {
      const { hasDummyData: exists } = await getDummyTeamClients();
      setHasDummyData(exists);
      
      if (exists) {
        // If dummy data exists, validate it
        validateAllClients();
      }
    } catch (error) {
      console.error('Failed to check dummy data:', error);
    }
  };

  const handleSetupDummyData = async () => {
    setLoading(true);
    try {
      const result = await setupDummyTeamData();
      setSetupResult(result);
      
      if (result.success) {
        setHasDummyData(true);
        // Validate the setup
        await validateAllClients();
      }
    } catch (error) {
      console.error('Failed to setup dummy data:', error);
      setSetupResult({
        success: false,
        clientsSetup: [],
        teamMembersCreated: 0,
        callsAssigned: 0,
        errors: [error.message]
      });
    } finally {
      setLoading(false);
    }
  };

  const validateAllClients = async () => {
    const clients = ['klinics-test', 'realty-co-test', 'tech-saas-test'];
    const results = {};
    
    for (const clientId of clients) {
      try {
        const validation = await validateTeamPerformance(clientId);
        results[clientId] = validation;
      } catch (error) {
        results[clientId] = { error: error.message };
      }
    }
    
    setValidationResults(results);
  };

  const getClientDisplayName = (clientId: string) => {
    const names = {
      'klinics-test': 'KLINICS (Healthcare)',
      'realty-co-test': 'REALTY_CO (Real Estate)', 
      'tech-saas-test': 'TECH_SAAS (Technology)'
    };
    return names[clientId] || clientId;
  };

  const renderValidationResult = (clientId: string, result: any) => {
    if (result.error) {
      return (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {result.error}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Team Members</p>
            <Badge variant="outline">{result.teamMemberCount}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Performance Data</p>
            <Badge variant={result.hasRealisticData ? "default" : "secondary"}>
              {result.hasRealisticData ? "Available" : "No Data"}
            </Badge>
          </div>
        </div>
        
        {result.assignmentStats && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Call Assignment Rate</p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {result.assignmentStats.assignedCalls}/{result.assignmentStats.totalCalls}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ({result.assignmentStats.assignmentRate.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}
        
        {result.performanceMetrics && result.performanceMetrics.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Performance Metrics Sample</p>
            <div className="text-xs space-y-1">
              {result.performanceMetrics.slice(0, 2).map((metric, index) => (
                <div key={index} className="flex justify-between">
                  <span>{metric.member_name}</span>
                  <span>{metric.total_calls} calls</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Performance Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasDummyData ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set up dummy team data to enable team performance features during development.
                This creates realistic team members for 3 test clients and assigns historical calls.
              </p>
              <Button 
                onClick={handleSetupDummyData} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Setting up dummy team data...
                  </>
                ) : (
                  'Setup Dummy Team Data'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Dummy team data is ready</span>
              </div>
              
              <Button 
                onClick={validateAllClients} 
                variant="outline"
                size="sm"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Validate Team Performance
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Results */}
      {setupResult && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={setupResult.success ? "default" : "destructive"}>
                  {setupResult.success ? "Success" : "Failed"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Team Members Created:</span>
                <Badge variant="outline">{setupResult.teamMembersCreated}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Calls Assigned:</span>
                <Badge variant="outline">{setupResult.callsAssigned}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Clients Setup:</span>
                <Badge variant="outline">{setupResult.clientsSetup.length}</Badge>
              </div>
              
              {setupResult.errors.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Setup Issues:</p>
                      <ul className="text-sm list-disc list-inside">
                        {setupResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results by Client */}
      {Object.keys(validationResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="klinics-test">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="klinics-test">Healthcare</TabsTrigger>
                <TabsTrigger value="realty-co-test">Real Estate</TabsTrigger>
                <TabsTrigger value="tech-saas-test">Technology</TabsTrigger>
              </TabsList>
              
              {Object.entries(validationResults).map(([clientId, result]) => (
                <TabsContent key={clientId} value={clientId}>
                  <div className="space-y-3">
                    <h4 className="font-medium">{getClientDisplayName(clientId)}</h4>
                    {renderValidationResult(clientId, result)}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

#### **Deliverables**
- [ ] Dummy team members created for 3 test clients with realistic roles and data
- [ ] Historical calls assigned to team members using existing bulk assignment function
- [ ] Team performance metrics calculated and validated with dummy data
- [ ] Dashboard components integrated with dummy team data display
- [ ] Documentation created for dummy data setup and validation procedures

---

## 🎯 **SUCCESS METRICS FOR PHASE 1**

### **Technical Validation**
- [ ] All Context7 MCP queries execute successfully with expected outputs
- [ ] Database schema validation passes all tests with realistic data
- [ ] Dummy team data setup creates realistic team performance scenarios
- [ ] Dashboard loads production data within 2-second target
- [ ] Multi-tenant RLS policies properly isolate client data

### **Feature Completeness**
- [ ] Next.js 15 project properly configured with TypeScript and shadcn/ui
- [ ] Supabase authentication works with multi-tenant context
- [ ] GHL PostMessage API foundation established for Phase 2 integration
- [ ] Database integration validated against @database_schema.md specifications
- [ ] Team performance data available for Phase 2 dashboard development

### **Performance Benchmarks**
- [ ] Project setup completed in <4 hours using Context7 MCP acceleration
- [ ] Database validation scripts execute in <30 seconds
- [ ] Dummy team data setup completes in <5 minutes
- [ ] All validation tests pass with realistic production data volumes

### **Quality Assurance**
- [ ] TypeScript compilation without errors across all components
- [ ] Database completion rates >70% for all critical dashboard fields
- [ ] Team assignment rate >80% for dummy team clients
- [ ] All validation dashboards display expected results correctly

---

## 🚨 **Common Issues & Troubleshooting**

### **Issue: npm install fails**
**Solution**: Clear npm cache and try again
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **Issue: TypeScript errors**
**Solution**: Check file imports and install missing type packages
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

### **Issue: Dashboard shows authentication error**
**Solution**: Check GHL context detection in browser console
- Open developer tools (F12)
- Look for PostMessage API logs
- Verify mock context is being set

### **Issue: Mock data not displaying**
**Solution**: Verify API route responses
```bash
# Test API endpoint directly
curl http://localhost:3000/api/dashboard/data?clientId=KLINICS
```

---

## 🎯 **Next Phase Preview**

**Phase 2 (Days 4-7)** will focus on:
- Building interactive dashboard components using v0.dev
- Implementing exact report format replication
- Adding real-time data updates
- Creating export functionality
- Refining team performance features

**Ready to proceed to Phase 2?** The foundation is now complete and ready for advanced dashboard development! 