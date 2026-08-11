import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format. Expected an array of providers.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src/app/admin/providers/manage/providersInfo.ts');
    const backupPath = path.join(process.cwd(), 'src/app/admin/providers/manage/providersInfo.backup.ts');
    
    // Validate that we have proper data to write
    if (data.length === 0) {
      return NextResponse.json({ error: 'Data array is empty.' }, { status: 400 });
    }
    
    // Create the rolling backup
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }
    
    // Create the file content
    const fileContent = `export const ALL_PROVIDERS_INFO = ${JSON.stringify(data, null, 2)};\n`;
    
    fs.writeFileSync(filePath, fileContent, 'utf8');
    
    return NextResponse.json({ success: true, message: 'Updated providersInfo.ts successfully!' });
  } catch (error) {
    console.error('Error updating providersInfo.ts:', error);
    return NextResponse.json({ error: 'Internal server error while saving data.' }, { status: 500 });
  }
}
