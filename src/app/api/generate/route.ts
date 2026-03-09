import { NextResponse } from 'next/server';
import { batchParseJavaFiles } from "../../../parser/index.js";

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

    return NextResponse.json({ mermaid: batchParseJavaFiles(fileContents) });


  } catch (error: unknown) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
