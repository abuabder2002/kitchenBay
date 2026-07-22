import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    const projectRoot = path.resolve(process.cwd());
    let addOutput = '';
    let commitOutput = '';
    let pushOutput = '';

    try {
      addOutput = execSync('git add -A', { cwd: projectRoot, encoding: 'utf-8' });
    } catch (e: any) {
      addOutput = e.message;
    }

    try {
      commitOutput = execSync('git commit -m "Production push updates"', { cwd: projectRoot, encoding: 'utf-8' });
    } catch (e: any) {
      commitOutput = e.stdout || e.message;
    }

    try {
      pushOutput = execSync('git push origin main --force-with-lease', { cwd: projectRoot, encoding: 'utf-8' });
    } catch (e: any) {
      try {
        pushOutput = execSync('git push', { cwd: projectRoot, encoding: 'utf-8' });
      } catch (err: any) {
        pushOutput = err.stderr || err.stdout || err.message;
      }
    }

    return NextResponse.json({ 
      success: true, 
      details: { addOutput, commitOutput, pushOutput } 
    });
  } catch (error: any) {
    const errorMsg = error.stdout?.toString() || error.stderr?.toString() || error.message;
    return NextResponse.json({ error: errorMsg, isError: true });
  }
}

