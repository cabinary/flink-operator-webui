'use client';

import { FlinkDeployment } from '@/types/flink';
import { useState } from 'react';

interface DeploymentTableProps {
  deployments: FlinkDeployment[];
  onRefresh: () => void;
}

export default function DeploymentTable({
  deployments,
  onRefresh,
}: DeploymentTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (
    deployment: FlinkDeployment,
    action: 'suspend' | 'resume'
  ) => {
    const { namespace = 'default', name } = deployment.metadata;
    setLoading(`${namespace}/${name}`);

    try {
      const response = await fetch(
        `/api/deployments/${namespace}/${name}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update deployment');
      }

      // Refresh the list after action
      onRefresh();
    } catch (error) {
      console.error('Error updating deployment:', error);
      alert('Failed to update deployment');
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (state?: string) => {
    switch (state?.toLowerCase()) {
      case 'running':
        return 'text-green-600 bg-green-50';
      case 'suspended':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Namespace
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job State
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lifecycle State
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {deployments.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                No FlinkDeployments found
              </td>
            </tr>
          ) : (
            deployments.map((deployment) => {
              const { namespace = 'default', name, creationTimestamp } =
                deployment.metadata;
              const jobState = deployment.spec.job?.state || 'N/A';
              const lifecycleState =
                deployment.status?.lifecycleState || 'N/A';
              const isLoading = loading === `${namespace}/${name}`;

              return (
                <tr key={`${namespace}/${name}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {namespace}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        jobState
                      )}`}
                    >
                      {jobState}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        lifecycleState
                      )}`}
                    >
                      {lifecycleState}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(creationTimestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {jobState === 'suspended' ? (
                      <button
                        onClick={() => handleAction(deployment, 'resume')}
                        disabled={isLoading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Processing...' : 'Resume'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(deployment, 'suspend')}
                        disabled={isLoading}
                        className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Processing...' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
