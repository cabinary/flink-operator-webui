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
  const kc = getKubeConfig();
  
  try {
    // Get cluster info
    const cluster = kc.getCurrentCluster();
    if (!cluster) {
      throw new Error('No current cluster configured');
    }
    
    // Build the API URL
    const url = `${cluster.server}/apis/flink.apache.org/v1beta1/namespaces/${namespace}/flinkdeployments/${name}`;
    
    // Prepare HTTPS options with proper SSL handling from kubeconfig
    const opts: any = {
      headers: {}
    };
    await kc.applyToHTTPSOptions(opts);
    
    // Import https module for making request with proper SSL
    const https = await import('https');
    const { URL } = await import('url');
    
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(patch);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Content-Length': Buffer.byteLength(postData),
        ...(opts.headers || {}),
      },
      ca: opts.ca,
      cert: opts.cert,
      key: opts.key,
      rejectUnauthorized: opts.rejectUnauthorized !== false,
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data) as FlinkDeployment);
            } catch (e) {
              reject(new Error(`Failed to parse response: ${e}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
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
