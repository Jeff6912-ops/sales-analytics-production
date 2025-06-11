'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Loader2, Users, TrendingUp } from 'lucide-react';

interface DummyDataSetupResult {
  success: boolean;
  clientsSetup: string[];
  teamMembersCreated: number;
  callsAssigned: number;
  errors: string[];
}

interface ValidationResult {
  metricsCalculated: boolean;
  teamMemberCount: number;
  performanceMetrics: any[];
  hasRealisticData: boolean;
  assignmentStats: {
    totalCalls: number;
    assignedCalls: number;
    assignmentRate: number;
  };
}

export function TeamPerformanceDemo() {
  const [setupResult, setSetupResult] = useState<DummyDataSetupResult | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult | { error: string }>>({});
  const [loading, setLoading] = useState(false);
  const [hasDummyData, setHasDummyData] = useState(false);

  useEffect(() => {
    checkDummyDataExists();
  }, []);

  const checkDummyDataExists = async () => {
    try {
      const response = await fetch('/api/dummy-data/check');
      const { hasDummyData: exists } = await response.json();
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
      const response = await fetch('/api/dummy-data/setup', { method: 'POST' });
      const result = await response.json();
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
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setLoading(false);
    }
  };

  const validateAllClients = async () => {
    const clients = ['KLINICS', 'REALTY', 'SAASCO'];
    const results: Record<string, ValidationResult | { error: string }> = {};
    
    for (const clientId of clients) {
      try {
        const response = await fetch(`/api/dummy-data/validate?clientId=${clientId}`);
        const validation = await response.json();
        results[clientId] = validation;
      } catch (error) {
        results[clientId] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    setValidationResults(results);
  };

  const getClientDisplayName = (clientId: string) => {
    const names: Record<string, string> = {
      'KLINICS': 'KLINICS (Healthcare)',
      'REALTY': 'REALTY (Real Estate)', 
      'SAASCO': 'SAASCO (Technology)'
    };
    return names[clientId] || clientId;
  };

  const renderValidationResult = (clientId: string, result: ValidationResult | { error: string }) => {
    if ('error' in result) {
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
              {result.performanceMetrics.slice(0, 2).map((metric: any, index: number) => (
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
            <Tabs defaultValue="KLINICS">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="KLINICS">Healthcare</TabsTrigger>
                <TabsTrigger value="REALTY">Real Estate</TabsTrigger>
                <TabsTrigger value="SAASCO">Technology</TabsTrigger>
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