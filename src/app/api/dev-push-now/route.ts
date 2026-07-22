import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    const projectRoot = path.resolve(process.cwd());
    
    // 1. Add all changes
    let addRes = '';
    try {
      addRes = execSync('git add -A', { cwd: projectRoot, encoding: 'utf-8' });
    } catch (e: any) {
      addRes = e.message;
    }

    // 2. Commit if needed
    let commitRes = '';
    try {
      commitRes = execSync('git commit -m "Push all local changes live"', { cwd: projectRoot, encoding: 'utf-8' });
    } catch (e: any) {
      commitRes = e.stdout || e.message;
    }

    // 3. Push to remote main
    let pushRes = '';
    try {
      pushRes = execSync('git push origin main', { cwd: projectRoot, encoding: 'utf-8' });
    } catch (e: any) {
      pushRes = e.stderr || e.stdout || e.message;
    }

    return NextResponse.json({
      success: true,
      addRes,
      commitRes,
      pushRes
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, isError: true }, { status: 500 });
  }
}
