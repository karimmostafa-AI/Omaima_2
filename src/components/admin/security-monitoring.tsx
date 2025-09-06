'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/store/auth-store';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  Eye,
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { SecurityEvent } from '@/types';

interface SecurityAlert {
  id: string;
  type: 'multiple_failed_logins' | 'suspicious_ip' | 'unusual_location' | 'brute_force';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

interface SecurityMonitoringProps {
  className?: string;
}

export function SecurityMonitoring({ className }: SecurityMonitoringProps) {
  const { getSecurityEvents, checkSuspiciousActivity, user } = useAuthStore();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'login' | 'failed_login' | 'admin_access'>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const securityEvents = await getSecurityEvents();
      setEvents(securityEvents);
      
      // Check for suspicious activity
      const suspiciousActivity = await checkSuspiciousActivity();
      if (suspiciousActivity.suspicious) {
        // Add to alerts (in real implementation, this would come from backend)
        const newAlert: SecurityAlert = {
          id: crypto.randomUUID(),
          type: 'multiple_failed_logins',
          severity: 'high',
          ip: 'unknown',
          details: { reason: suspiciousActivity.details },
          timestamp: new Date(),
          resolved: false
        };
        setAlerts([newAlert]);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  }).filter(event => {
    const now = new Date();
    const eventTime = new Date(event.timestamp);
    const diff = now.getTime() - eventTime.getTime();
    
    switch (timeRange) {
      case '1h':
        return diff <= 60 * 60 * 1000;
      case '24h':
        return diff <= 24 * 60 * 60 * 1000;
      case '7d':
        return diff <= 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return diff <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed_login':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'admin_access':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'mfa_enabled':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'ip_blocked':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const exportEvents = () => {
    const csv = [
      'Timestamp,Type,IP,User Agent,Details',
      ...filteredEvents.map(event => [
        event.timestamp.toISOString(),
        event.type,
        event.ip,
        event.userAgent,
        JSON.stringify(event.details || {})
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-events-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor authentication events and security alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSecurityData}
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportEvents}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Security Alerts */}
      {alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Alert:</strong> {alerts.length} unresolved security alert(s) detected.
            <Button variant="link" className="p-0 h-auto ml-2">
              View Details
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Logins</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEvents.filter(e => e.type === 'login').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Authentication success
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEvents.filter(e => e.type === 'failed_login').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Authentication failures
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Access</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEvents.filter(e => e.type === 'admin_access').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Administrative actions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-input bg-background px-3 py-1 text-sm rounded-md"
              >
                <option value="all">All Events</option>
                <option value="login">Successful Logins</option>
                <option value="failed_login">Failed Logins</option>
                <option value="admin_access">Admin Access</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-input bg-background px-3 py-1 text-sm rounded-md"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Authentication and security-related events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No events found for the selected criteria
                    </div>
                  ) : (
                    filteredEvents.map((event) => (
                      <div
                        key={event.id || `${event.timestamp}-${event.type}`}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        {getEventIcon(event.type)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getEventTypeLabel(event.type)}
                            </Badge>
                            <span className="text-sm font-medium">
                              {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm:ss')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{event.ip}</span>
                            <Monitor className="h-3 w-3 ml-2" />
                            <span className="truncate max-w-48">
                              {event.userAgent.split(' ')[0]}
                            </span>
                          </div>
                          
                          {event.details && Object.keys(event.details).length > 0 && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {JSON.stringify(event.details, null, 0).slice(0, 100)}...
                            </div>
                          )}
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Automated security alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                  <p className="text-muted-foreground">
                    All security alerts have been resolved
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <span className="font-semibold">
                            {alert.type.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                          </span>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(alert.timestamp), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {JSON.stringify(alert.details)}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Investigate
                        </Button>
                        <Button size="sm" variant="ghost">
                          Mark Resolved
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security monitoring and alert preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Security monitoring settings would be configured here in a full implementation.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
