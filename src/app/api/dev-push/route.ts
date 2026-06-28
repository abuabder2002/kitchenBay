import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    const projectRoot = path.resolve(process.cwd());
    const stdout = execSync('git add . && git commit -m "Applied requested updates" && git push', { 
      cwd: projectRoot, 
      encoding: 'utf-8' 
    });
    return NextResponse.json({ success: true, output: stdout });
  } catch (error: any) {
    const errorMsg = error.stdout?.toString() || error.stderr?.toString() || error.message;
    return NextResponse.json({ error: errorMsg, isError: true });
  }
}
