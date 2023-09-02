import { NextRequest, NextResponse } from 'next/server';
import { drive_v3, google } from 'googleapis';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const actions = ['import', 'backup', 'delete'];

async function createDriveInstance(accessToken: string) {
  if (!accessToken) throw new Error('Missing accessToken');
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  google.options({ auth: oauth2Client });
  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
  });
  return drive;
}

async function verifyAccessToken(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
  return tokenInfo;
}

async function createDriveFile(drive: drive_v3.Drive, content: string) {
  const mimeType = 'text/plain';
  const fileMetadata = {
    parents: ['appDataFolder'],
    name: process.env.GOOGLE_DRIVE_FILE_NAME,
    mimeType,
  };
  const media = {
    mimeType,
    body: content,
  };
  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
  });

  if (!res.data || res.status !== 200) throw new Error('Error creating file');
  return res.data;
}

async function getBackupFileId(drive: drive_v3.Drive) {
  let id;
  const list = await drive.files.list({
    q: `name='${process.env.GOOGLE_DRIVE_FILE_NAME}'`,
    spaces: 'appDataFolder',
  });

  if (list.data.files?.length) {
    id = list.data.files[0].id!;
  }

  return id;
}

async function getBackupFileContent(drive: drive_v3.Drive) {
  const id = await getBackupFileId(drive);
  if (!id) throw new Error('Backup file not found');

  const res = await drive.files.get({
    fileId: `${id}`,
    alt: 'media',
  });

  if (!res.data || res.status !== 200)
    throw new Error('Error getting file content');
  return res.data as string;
}

async function updateDriveFile(drive: drive_v3.Drive, content: string) {
  const fileId = await getBackupFileId(drive);
  if (!fileId) {
    const res = createDriveFile(drive, content);
    return res;
  }
  const media = {
    mimeType: 'text/plains',
    body: content,
  };
  const res = await drive.files.update({
    fileId,
    media,
  });

  if (!res.data || res.status !== 200) throw new Error('Error updating file');
  return res.data;
}

async function deleteDriveFile(drive: drive_v3.Drive) {
  const fileId = await getBackupFileId(drive);
  if (!fileId) throw new Error('Backup file not found');

  const res = await drive.files.delete({
    fileId,
  });

  return res.data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.data) {
      return NextResponse.json(
        { success: false, error: 'Missing data parameter' },
        { status: 400, headers: { ...CORS_HEADERS } }
      );
    }

    const { accessToken, action, content } = body.data;

    if (!actions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400, headers: { ...CORS_HEADERS } }
      );
    }

    if (action === 'backup' && !content) {
      return NextResponse.json(
        { success: false, error: 'Missing content parameter' },
        { status: 400, headers: { ...CORS_HEADERS } }
      );
    }

    // Verify access token
    const tokenInfo = await verifyAccessToken(accessToken);

    const scopes = process.env.NEXT_PUBLIC_GOOGLE_SCOPES?.split(' ');
    if (
      !tokenInfo.scopes ||
      !scopes?.every((scope) => tokenInfo.scopes.includes(scope))
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid access token' },
        { status: 400, headers: { ...CORS_HEADERS } }
      );
    }

    const drive = await createDriveInstance(accessToken);

    if (!drive) {
      return NextResponse.json(
        { success: false, error: 'Error creating drive instance' },
        { status: 500, headers: { ...CORS_HEADERS } }
      );
    }
    switch (action) {
      case 'import': {
        const fileContent = await getBackupFileContent(drive);
        return NextResponse.json(
          { success: true, data: fileContent },
          { status: 200, headers: { ...CORS_HEADERS } }
        );
      }
      case 'backup': {
        await updateDriveFile(drive, content);
        return NextResponse.json(
          { success: true },
          { status: 200, headers: { ...CORS_HEADERS } }
        );
      }
      case 'delete': {
        await deleteDriveFile(drive);
        return NextResponse.json(
          { success: true },
          { status: 200, headers: { ...CORS_HEADERS } }
        );
      }
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400, headers: { ...CORS_HEADERS } }
        );
    }
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 500, headers: { ...CORS_HEADERS } }
    );
  }
}