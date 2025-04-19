
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Bug, 
  Terminal, 
  AlarmClock,
  Shield, 
  Settings, 
  FileSearch,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { DiagnosticIssue, getSeverityColorClass } from '@/utils/aiDiagnostics';
import { Button } from '@/components/ui/button';

interface BotDiagnosticsProps {
  issues: DiagnosticIssue[];
  onRefresh: () => void;
  isLoading: boolean;
}

const BotDiagnostics = ({ issues, onRefresh, isLoading }: BotDiagnosticsProps) => {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  // Automatically expand the most severe issue
  useEffect(() => {
    if (issues.length > 0) {
      // Find the most severe issue
      const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      const mostSevereIssue = issues.reduce((prev, current) => {
        return (severityOrder[prev.severity as keyof typeof severityOrder] <= 
                severityOrder[current.severity as keyof typeof severityOrder]) ? prev : current;
      });
      
      setExpandedIssue(mostSevereIssue.id);
    } else {
      setExpandedIssue(null);
    }
  }, [issues]);

  // Toggle issue expansion
  const toggleIssue = (issueId: string) => {
    setExpandedIssue(expandedIssue === issueId ? null : issueId);
  };

  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'price_simulation':
        return <FileSearch className="h-4 w-4" />;
      case 'transaction_failure':
        return <AlertTriangle className="h-4 w-4" />;
      case 'connectivity':
        return <Terminal className="h-4 w-4" />;
      case 'performance':
        return <AlarmClock className="h-4 w-4" />;
      case 'configuration':
        return <Settings className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bug className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center text-lg">
              <Bug className="h-5 w-5 mr-2 text-primary" />
              Bot Diagnostics
            </CardTitle>
            <CardDescription>AI-powered problem detection and analysis</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Scanning...' : 'Scan for Issues'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-600 mb-1">All Systems Operational</h3>
            <p className="text-sm text-muted-foreground">
              No issues detected with your arbitrage bot configuration
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div 
                key={issue.id} 
                className="border rounded-md overflow-hidden"
              >
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleIssue(issue.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${getSeverityColorClass(issue.severity)}`}>
                      {getCategoryIcon(issue.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{issue.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Severity: <span className={`${getSeverityColorClass(issue.severity)} font-medium`}>
                          {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    {expandedIssue === issue.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {expandedIssue === issue.id && (
                  <div className="p-3 pt-0 border-t">
                    <p className="text-sm mb-2">{issue.description}</p>
                    <div className="bg-muted/50 p-2 rounded-md">
                      <h5 className="text-xs font-medium mb-1">Recommended Action:</h5>
                      <p className="text-xs">{issue.potentialFix}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BotDiagnostics;
