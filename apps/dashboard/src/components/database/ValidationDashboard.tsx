'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

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

interface ProductionAccessResult {
  connected: boolean;
  totalClients: number;
  activeGHLClients: number;
  sampleClients: Array<{
    id: string;
    name: string;
    hasGHL: boolean;
  }>;
}

export function DatabaseValidationDashboard() {
  const [validationResult, setValidationResult] = useState<DatabaseValidationResult | null>(null);
  const [productionAccess, setProductionAccess] = useState<ProductionAccessResult | null>(null);
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

  const validateDatabaseSchema = async (): Promise<DatabaseValidationResult> => {
    const errors: string[] = [];
    let fieldsValid = false;
    let teamPerformanceValid = false;
    let rlsValid = false;
    let performanceValid = false;
    let completionRates = { heatcheck: 0, needs: 0, objections: 0, outcomes: 0 };

    try {
      // Test 1: Validate required dashboard fields exist and have data
      const response = await fetch('/api/validate/database-fields');
      const fieldData = await response.json();
      
      if (fieldData.error) {
        errors.push(`Field validation failed: ${fieldData.error}`);
      } else if (fieldData.data && fieldData.data.length > 0) {
        // Calculate completion rates
        const total = fieldData.data.length;
        completionRates = {
          heatcheck: (fieldData.data.filter((r: any) => r.heatcheck_score).length / total) * 100,
          needs: (fieldData.data.filter((r: any) => r.top_need_pain_point).length / total) * 100,
          objections: (fieldData.data.filter((r: any) => r.main_objection).length / total) * 100,
          outcomes: (fieldData.data.filter((r: any) => r.call_outcome).length / total) * 100
        };
        
        fieldsValid = Object.values(completionRates).every(rate => rate >= 70);
        
        if (!fieldsValid) {
          errors.push(`Low completion rates: ${JSON.stringify(completionRates)}`);
        }
      }
      
      // Test 2: Validate team performance function
      const teamResponse = await fetch('/api/validate/team-performance');
      const teamData = await teamResponse.json();
      
      if (teamData.error) {
        errors.push(`Team performance validation failed: ${teamData.error}`);
      } else {
        teamPerformanceValid = true;
      }
      
      // Test 3: Validate dashboard view works
      const viewResponse = await fetch('/api/validate/dashboard-view');
      const viewData = await viewResponse.json();
      
      if (viewData.error) {
        errors.push(`Dashboard view validation failed: ${viewData.error}`);
      } else {
        rlsValid = true;
      }
      
      // Test 4: Performance validation
      const startTime = Date.now();
      const perfResponse = await fetch('/api/validate/performance');
      const queryTime = Date.now() - startTime;
      
      const perfData = await perfResponse.json();
      if (perfData.error) {
        errors.push(`Performance validation failed: ${perfData.error}`);
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
  };

  const validateProductionDataAccess = async (): Promise<ProductionAccessResult> => {
    try {
      const response = await fetch('/api/validate/production-access');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Production database access failed: ${data.error}`);
      }
      
      return data;
      
    } catch (error) {
      throw new Error(`Production validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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