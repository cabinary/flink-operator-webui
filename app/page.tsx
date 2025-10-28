'use client';

import { useState, useEffect } from 'react';
import { FlinkDeployment } from '@/types/flink';
import DeploymentTable from '@/components/DeploymentTable';

export default function Home() {
  const [deployments, setDeployments] = useState<FlinkDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/deployments');
      if (!response.ok) {
        throw new Error('Failed to fetch deployments');
      }
      const data = await response.json();
      setDeployments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchDeployments, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Flink Operator WebUI
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage Flink deployments on Kubernetes
              </p>
            </div>
            <button
              onClick={fetchDeployments}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Make sure you have access to the Kubernetes cluster and the
                FlinkDeployment CRD is installed.
              </p>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {loading && deployments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Loading deployments...
              </div>
            ) : (
              <DeploymentTable
                deployments={deployments}
                onRefresh={fetchDeployments}
              />
            )}
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              About
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                This Web UI allows you to monitor and manage Apache Flink
                deployments running on Kubernetes using the Flink Kubernetes
                Operator.
              </p>
              <p>
                <strong>Features:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>View all FlinkDeployment resources across the cluster</li>
                <li>Monitor job status and lifecycle state</li>
                <li>Suspend and resume Flink jobs</li>
                <li>Auto-refresh every 10 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
