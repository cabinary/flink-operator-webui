# flink-operator-webui

A Web UI for managing Apache Flink deployments on Kubernetes using the Flink Kubernetes Operator.

## Features

- 🔍 **Monitor Deployments**: View all FlinkDeployment resources across your Kubernetes cluster
- ▶️ **Control Jobs**: Suspend and resume Flink jobs with a single click
- 🔄 **Auto-refresh**: Automatically updates deployment status every 10 seconds
- 🎨 **Modern UI**: Built with Next.js and Tailwind CSS for a responsive, user-friendly experience

## Prerequisites

- Node.js 18+ and npm
- Access to a Kubernetes cluster with FlinkDeployment CRD installed
- Proper kubeconfig configuration or running within a Kubernetes pod with appropriate RBAC permissions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/flink-operator-webui.git
cd flink-operator-webui
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Mode

```bash
npm run build
npm start
```

## Kubernetes Deployment

To deploy this application in your Kubernetes cluster:

1. Ensure the application has the necessary RBAC permissions to access FlinkDeployment resources
2. The application will automatically use in-cluster configuration when running as a pod

### Required RBAC Permissions

The application needs the following permissions:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: flink-operator-webui
rules:
- apiGroups: ["flink.apache.org"]
  resources: ["flinkdeployments"]
  verbs: ["get", "list", "watch", "patch", "update"]
```

## Usage

1. **View Deployments**: The main page displays all FlinkDeployment resources with their current status
2. **Suspend a Job**: Click the "Suspend" button next to a running deployment
3. **Resume a Job**: Click the "Resume" button next to a suspended deployment
4. **Refresh**: Click the "Refresh" button to manually update the deployment list

## Technology Stack

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **@kubernetes/client-node**: Official Kubernetes client for Node.js

## API Routes

- `GET /api/deployments` - List all FlinkDeployment resources
- `GET /api/deployments/[namespace]/[name]` - Get a specific FlinkDeployment
- `PATCH /api/deployments/[namespace]/[name]` - Update a FlinkDeployment (suspend/resume)

## Development

```bash
# Run linter
npm run lint

# Run development server
npm run dev

# Build for production
npm run build
```

## License

See [LICENSE](LICENSE) file for details.
