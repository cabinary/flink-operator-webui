import { NextResponse } from 'next/server';
import { listFlinkDeployments } from '@/lib/kubernetes';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const deployments = await listFlinkDeployments();
    return NextResponse.json(deployments);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deployments', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
