import * as k8s from '@kubernetes/client-node';
import { FlinkDeployment, FlinkDeploymentList } from '@/types/flink';

// Initialize Kubernetes client
export function getKubeConfig(): k8s.KubeConfig {
  const kc = new k8s.KubeConfig();
  
  // Try to load config from different sources
  try {
    // First try in-cluster config (when running in a pod)
    kc.loadFromCluster();
  } catch {
    try {
      // Fall back to default kubeconfig file
      kc.loadFromDefault();
    } catch (e2) {
      console.error('Failed to load kubeconfig:', e2);
      throw new Error('Could not load Kubernetes configuration');
    }
  }
  
  return kc;
}

// Create custom objects API client
export function getCustomObjectsApi() {
  const kc = getKubeConfig();
  return k8s.KubernetesObjectApi.makeApiClient(kc);
}

// FlinkDeployment CRD information
export const FLINK_API_VERSION = 'flink.apache.org/v1beta1';
export const FLINK_KIND = 'FlinkDeployment';

// List all FlinkDeployment resources across all namespaces
export async function listFlinkDeployments(): Promise<FlinkDeployment[]> {
  const client = getCustomObjectsApi();
  
  try {
    // List all FlinkDeployments across all namespaces
    const response = await client.list(FLINK_API_VERSION, FLINK_KIND);
    return response.items as FlinkDeployment[];
  } catch (error) {
    console.error('Error listing FlinkDeployments:', error);
    return [];
  }
}

// Get a specific FlinkDeployment
export async function getFlinkDeployment(
  namespace: string,
  name: string
): Promise<FlinkDeployment> {
  const client = getCustomObjectsApi();
  
  try {
    const response = await client.read({
      apiVersion: FLINK_API_VERSION,
      kind: FLINK_KIND,
      metadata: {
        name,
        namespace,
      },
    });
    
    return response as FlinkDeployment;
  } catch (error) {
    console.error('Error getting FlinkDeployment:', error);
    throw error;
  }
}

// Update a FlinkDeployment (patch)
export async function patchFlinkDeployment(
  namespace: string,
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: any
): Promise<FlinkDeployment> {
  const client = getCustomObjectsApi();
  
  try {
    // First, get the current deployment
    const current = await getFlinkDeployment(namespace, name);
    
    // Merge the patch with the current deployment
    const updated: FlinkDeployment = {
      ...current,
      spec: {
        ...current.spec,
        ...(patch.spec || {}),
        job: {
          ...current.spec.job,
          ...(patch.spec?.job || {}),
        },
      },
    };
    
    const response = await client.patch(updated as unknown as k8s.KubernetesObject);
    return response as FlinkDeployment;
  } catch (error) {
    console.error('Error patching FlinkDeployment:', error);
    throw error;
  }
}

// Suspend a FlinkDeployment (set spec.job.state to suspended)
export async function suspendFlinkDeployment(
  namespace: string,
  name: string
): Promise<FlinkDeployment> {
  return patchFlinkDeployment(namespace, name, {
    spec: {
      job: {
        state: 'suspended'
      }
    }
  });
}

// Resume a FlinkDeployment (set spec.job.state to running)
export async function resumeFlinkDeployment(
  namespace: string,
  name: string
): Promise<FlinkDeployment> {
  return patchFlinkDeployment(namespace, name, {
    spec: {
      job: {
        state: 'running'
      }
    }
  });
}

