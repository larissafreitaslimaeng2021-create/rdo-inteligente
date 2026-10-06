export interface ObraDriveStructure {
  obraId: string;
  codigoObra: string;
  nomeObra: string;
  rootFolderName: string;
  folderUrl: string;
  folderId?: string;
  subpastas: {
    rdos: string;
    fotos: string;
    documentos: string;
  };
}

/**
 * Resolves a safe, working Google Drive URL.
 * Prevents 404 errors caused by mock/dummy folder IDs (like 'demo-rdo-obra-solar' or placeholder IDs).
 */
export function resolveDriveUrl(url?: string, obraNome?: string): string {
  if (
    url &&
    url.trim().length > 0 &&
    !url.includes('demo-rdo-obra-solar') &&
    !url.includes('drive_folder_') &&
    url.startsWith('http')
  ) {
    return url.trim();
  }

  // If obra name is provided, search inside user's Google Drive directly
  if (obraNome && obraNome.trim().length > 0) {
    const cleanName = obraNome
      .replace(/\[DADOS DE DEMONSTRAÇÃO\]/gi, '')
      .replace(/\[DEMO\]/gi, '')
      .trim();
    if (cleanName) {
      return `https://drive.google.com/drive/u/0/search?q=${encodeURIComponent(cleanName)}`;
    }
  }

  // Fallback to user's root Google Drive
  return 'https://drive.google.com/drive/u/0/my-drive';
}

/**
 * Creates the real folder and 3 subfolders (/RDOs, /Fotos, /Documentos) in the user's Google Drive via Drive REST API.
 */
export async function createRealDriveFolder(
  accessToken: string,
  codigo: string,
  nome: string
): Promise<{
  folderId: string;
  folderUrl: string;
  subfolders: { rdosId: string; fotosId: string; docsId: string };
}> {
  const cleanName = nome.replace(/\[DADOS DE DEMONSTRAÇÃO\]/gi, '').trim();
  const rootFolderName = `Obra - ${codigo} ${cleanName}`;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // 1. Check if folder already exists in Drive
  const query = encodeURIComponent(
    `name = '${rootFolderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
    { headers }
  );

  let parentFolderId = '';
  let webViewLink = '';

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      parentFolderId = searchData.files[0].id;
      webViewLink = searchData.files[0].webViewLink || `https://drive.google.com/drive/folders/${parentFolderId}`;
    }
  }

  // 2. If not found, create the parent folder in Google Drive
  if (!parentFolderId) {
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: rootFolderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      throw new Error(`Erro ao criar pasta no Google Drive: ${errBody}`);
    }

    const createdData = await createRes.json();
    parentFolderId = createdData.id;
    webViewLink = createdData.webViewLink || `https://drive.google.com/drive/folders/${parentFolderId}`;
  }

  // 3. Helper to create a subfolder if it does not exist
  const createSubfolder = async (subName: string): Promise<string> => {
    const subQuery = encodeURIComponent(
      `name = '${subName}' and '${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const subSearch = await fetch(`https://www.googleapis.com/drive/v3/files?q=${subQuery}&fields=files(id)`, {
      headers,
    });
    if (subSearch.ok) {
      const data = await subSearch.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: subName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      }),
    });
    if (res.ok) {
      const d = await res.json();
      return d.id;
    }
    return '';
  };

  const [rdosId, fotosId, docsId] = await Promise.all([
    createSubfolder('RDOs'),
    createSubfolder('Fotos'),
    createSubfolder('Documentos'),
  ]);

  return {
    folderId: parentFolderId,
    folderUrl: webViewLink || `https://drive.google.com/drive/folders/${parentFolderId}`,
    subfolders: { rdosId, fotosId, docsId },
  };
}

export function buildObraDriveStructure(codigo: string, nome: string, customUrl?: string): ObraDriveStructure {
  const rootFolderName = `Obra - ${codigo} ${nome}`;
  return {
    obraId: codigo,
    codigoObra: codigo,
    nomeObra: nome,
    rootFolderName,
    folderUrl: resolveDriveUrl(customUrl, nome),
    subpastas: {
      rdos: `${rootFolderName}/RDOs`,
      fotos: `${rootFolderName}/Fotos`,
      documentos: `${rootFolderName}/Documentos`,
    },
  };
}

export async function uploadPdfToDrive(
  pdfBlob: Blob,
  fileName: string,
  obraFolderName: string,
  subpasta: 'RDOs' | 'Fotos' | 'Documentos' = 'RDOs'
): Promise<{ success: boolean; driveFileId: string; driveUrl: string; message: string }> {
  const driveFileId = `drive_file_${Date.now()}`;
  const driveUrl = 'https://drive.google.com/drive/u/0/my-drive';

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        driveFileId,
        driveUrl,
        message: `Arquivo "${fileName}" preparado para sincronização na pasta Google Drive: ${obraFolderName}/${subpasta}`,
      });
    }, 700);
  });
}
