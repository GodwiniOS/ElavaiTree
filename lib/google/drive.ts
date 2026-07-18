import { getDriveClient } from './google';
import { Readable } from 'stream';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

export async function listDriveFolderFiles(folderId: string): Promise<DriveFile[]> {
  try {
    const drive = await getDriveClient();
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink)',
      spaces: 'drive',
    });

    return (response.data.files || []).map(f => ({
      id: f.id || '',
      name: f.name || '',
      mimeType: f.mimeType || '',
      webViewLink: f.webViewLink || undefined,
      webContentLink: f.webContentLink || undefined,
      thumbnailLink: f.thumbnailLink || undefined,
    }));
  } catch (err: any) {
    console.error('Error listing Google Drive files:', err);
    return [];
  }
}

export async function uploadFileToDrive(
  folderId: string,
  name: string,
  mimeType: string,
  buffer: Buffer
): Promise<DriveFile> {
  try {
    const drive = await getDriveClient();
    
    // Convert Buffer to readable stream
    const mediaStream = new Readable();
    mediaStream.push(buffer);
    mediaStream.push(null);

    const response = await drive.files.create({
      requestBody: {
        name,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: mediaStream,
      },
      fields: 'id, name, mimeType, webViewLink, webContentLink, thumbnailLink',
    });

    // Make file accessible to anyone with the link so it renders correctly in our app
    try {
      await drive.permissions.create({
        fileId: response.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permError) {
      console.warn('Could not set file permission to public reader. Access might be restricted.', permError);
    }

    return {
      id: response.data.id || '',
      name: response.data.name || '',
      mimeType: response.data.mimeType || '',
      webViewLink: response.data.webViewLink || undefined,
      webContentLink: response.data.webContentLink || undefined,
      thumbnailLink: response.data.thumbnailLink || undefined,
    };
  } catch (err: any) {
    console.error('Error uploading file to Drive:', err);
    throw err;
  }
}

export async function createDriveFolder(folderName: string, parentFolderId?: string): Promise<string> {
  try {
    const drive = await getDriveClient();
    
    const parents = parentFolderId ? [parentFolderId] : undefined;
    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents,
      },
      fields: 'id',
    });

    return response.data.id || '';
  } catch (err: any) {
    console.error('Error creating Google Drive folder:', err);
    throw err;
  }
}
