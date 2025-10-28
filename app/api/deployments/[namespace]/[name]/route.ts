import { NextRequest, NextResponse } from 'next/server';
import {
  getFlinkDeployment,
  suspendFlinkDeployment,
  resumeFlinkDeployment,
} from '@/lib/kubernetes';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    namespace: string;
    name: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { namespace, name } = await params;
    const deployment = await getFlinkDeployment(namespace, name);
    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Error fetching deployment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deployment', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { namespace, name } = await params;
    const body = await request.json();
    const { action } = body;

    let deployment;
    if (action === 'suspend') {
      deployment = await suspendFlinkDeployment(namespace, name);
    } else if (action === 'resume') {
      deployment = await resumeFlinkDeployment(namespace, name);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "suspend" or "resume"' },
        { status: 400 }
      );
    }

    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Error updating deployment:', error);
    return NextResponse.json(
      { error: 'Failed to update deployment', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
