// FlinkDeployment Custom Resource types
export interface FlinkDeploymentSpec {
  image?: string;
  flinkVersion?: string;
  serviceAccount?: string;
  jobManager?: {
    resource?: {
      memory?: string;
      cpu?: number;
    };
    replicas?: number;
  };
  taskManager?: {
    resource?: {
      memory?: string;
      cpu?: number;
    };
    replicas?: number;
  };
  job?: {
    jarURI?: string;
    parallelism?: number;
    upgradeMode?: string;
    state?: 'running' | 'suspended';
    savepointTriggerNonce?: number;
    entryClass?: string;
    args?: string[];
  };
  flinkConfiguration?: Record<string, string>;
  logConfiguration?: Record<string, string>;
}

export interface FlinkDeploymentStatus {
  lifecycleState?: string;
  jobStatus?: {
    state?: string;
    jobId?: string;
    jobName?: string;
    startTime?: string;
    updateTime?: string;
    savepointInfo?: {
      lastSavepoint?: {
        location?: string;
        timeStamp?: number;
      };
    };
  };
  error?: string;
  clusterInfo?: Record<string, string>;
  reconciliationStatus?: {
    state?: string;
    lastReconciledSpec?: string;
  };
}

export interface FlinkDeployment {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    uid?: string;
    resourceVersion?: string;
    creationTimestamp?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec: FlinkDeploymentSpec;
  status?: FlinkDeploymentStatus;
}

export interface FlinkDeploymentList {
  apiVersion: string;
  kind: string;
  items: FlinkDeployment[];
  metadata?: {
    resourceVersion?: string;
  };
}
