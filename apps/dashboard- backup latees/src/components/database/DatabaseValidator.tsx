'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Loader2, Database } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ValidationResult {
  connected: boolean;
  tablesExist: boolean;
  hasData: boolean;
  clientCount: number;
  callCount: number;
  teamCount: number;
  sampleData: any[];
  errors: string[];
}

export function DatabaseValidator() {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runValidation = async () => {
    setLoading(true);
    const errors: string[] = [];
    let connected = false;
    let tablesExist = false;
    let hasData = false;
    let clientCount = 0;
    let callCount = 0;
    let teamCount = 0;
    let sampleData: any[] = [];

    try {
      const supabase = createClient();

      // Test 1: Basic connection
      console.log('Testing Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('clients')
        .select('count', { count: 'exact', head: true });
      
      if (connectionError) {
        errors.push(`Connection failed: ${connectionError.message}`);
      } else {
        connected = true;
        clientCount = connectionTest?.length || 0;
      }

      // Test 2: Check if required tables exist
      if (connected) {
        console.log('Checking table structure...');
        const { data: callData, error: callError } = await supabase
          .from('call_messages')
          .select('count', { count: 'exact', head: true });

        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('count', { count: 'exact', head: true });

        if (callError) {
          errors.push(`call_messages table error: ${callError.message}`);
        } else {
          tablesExist = true;
          callCount = callData?.length || 0;
        }

        if (teamError) {
          errors.push(`team_members table error: ${teamError.message}`);
        } else {
          teamCount = teamData?.length || 0;
        }
      }

      // Test 3: Check for actual data and schema
      if (tablesExist) {
        console.log('Checking data availability...');
        const { data: sampleCalls, error: sampleError } = await supabase
          .from('call_messages')
          .select(`
            id,
            client_id,
            created_at,
            analysis,
            contact_name
          `)
          .limit(5);

        if (sampleError) {
          errors.push(`Sample data error: ${sampleError.message}`);
        } else if (sampleCalls && sampleCalls.length > 0) {
          hasData = true;
          sampleData = sampleCalls;
        }
      }

      // Test 4: Check if dashboard views exist
      if (connected) {
        console.log('Testing dashboard views...');
        const { data: viewData, error: viewError } = await supabase
          .from('dashboard_call_data_with_team')
          .select('*')
          .limit(1);

        if (viewError) {
          errors.push(`Dashboard view error: ${viewError.message}`);
        }
      }

    } catch (error) {
      errors.push(`Validation exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setResult({
      connected,
      tablesExist,
      hasData,
      clientCount,
      callCount,
      teamCount,
      sampleData,
      errors
    });
    setLoading(false);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "✓" : "✗"} {label}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Production Database Validation</span>
          </div>
          <Button onClick={runValidation} disabled={loading} size="sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validate'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {getStatusBadge(result.connected, "Connected")}
              {getStatusBadge(result.tablesExist, "Tables")}
              {getStatusBadge(result.hasData, "Data")}
              {getStatusBadge(result.errors.length === 0, "Valid")}
            </div>

            {/* Data Counts */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{result.clientCount}</div>
                <div className="text-sm text-muted-foreground">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{result.callCount}</div>
                <div className="text-sm text-muted-foreground">Calls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{result.teamCount}</div>
                <div className="text-sm text-muted-foreground">Team Members</div>
              </div>
            </div>

            {/* Sample Data */}
            {result.sampleData.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sample Call Data</h4>
                <div className="text-xs space-y-1">
                  {result.sampleData.map((call, index) => (
                    <div key={index} className="flex justify-between border-b pb-1">
                      <span>{call.contact_name || 'Unknown Contact'}</span>
                      <span className="text-muted-foreground">
                        {call.client_id} • {new Date(call.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Validation Issues:</p>
                    <ul className="text-sm list-disc list-inside">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Click "Validate" to test the production database connection
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 