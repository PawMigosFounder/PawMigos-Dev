'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AdminAuditPage() {
  const [data, setData] = useState<any>({ logs: [], pagination: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/api/admin/audit').then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Audit Logs</h1>
        {loading ? (
          <div className="animate-pulse bg-white rounded-2xl h-40" />
        ) : data.logs.length === 0 ? (
          <Card><CardContent className="text-center py-8 text-gray-500">No audit logs yet</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {data.logs.map((log: any) => (
              <Card key={log.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge>{log.actionType}</Badge>
                      <span className="text-sm text-gray-500 ml-2">on {log.targetEntity} #{log.targetId.slice(0,8)}</span>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">By: {log.adminUser?.name || log.adminUserId}</p>
                  {log.details && <p className="text-xs text-gray-400 mt-0.5">{log.details}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
