import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Combine all Java files into a JSON array
    const fileContents: string[] = [];
    for (const file of files) {
      fileContents.push(await file.text());
    }

    // Determine path to python script
    // It's in the sibling directory 'python-parser'
    const scriptPath = path.resolve(process.cwd(), '../python-parser/parse_java.py');

    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [scriptPath]);
      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error("Python Error:", errorData);
          resolve(NextResponse.json({ error: 'Failed to parse Java files' }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ mermaid: outputData }));
        }
      });

      // Write JSON string of file contents to stdin of python process
      pythonProcess.stdin.write(JSON.stringify(fileContents));
      pythonProcess.stdin.end();
    });

  } catch (error: unknown) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
