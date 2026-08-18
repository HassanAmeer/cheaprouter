import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminToken } from '@/lib/verify-admin-token';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const ok = await verifyAdminToken(token);
  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backupPath = path.join(process.cwd(), 'src/app/admin/providers/manage/providersInfo.backup.ts');
    
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: 'No backup found.' }, { status: 404 });
    }
    
    // Read the backup file
    const fileContent = fs.readFileSync(backupPath, 'utf8');
    
    // Extract the JSON array from the file content
    // The file is structured as: `export const ALL_PROVIDERS_INFO = [...];`
    let jsonData = fileContent.replace('export const ALL_PROVIDERS_INFO = ', '').trim();
    
    // Remove the trailing semicolon if it exists
    if (jsonData.endsWith(';')) {
      jsonData = jsonData.slice(0, -1);
    }
    
    return NextResponse.json({ success: true, data: JSON.parse(jsonData) });
  } catch (error) {
    console.error('Error fetching backup:', error);
    return NextResponse.json({ error: 'Failed to read backup.' }, { status: 500 });
  }
}