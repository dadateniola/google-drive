type DriveFile = gapi.client.drive.File;

// ✅ Fetch direct children (non-recursive)
export const getImmediateChildren = async (
  folderId: string
): Promise<DriveFile[] | null> => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${process.env.NEXT_PUBLIC_API_KEY}`
    );

    const data = await res.json();

    if (!data.files) return [];

    return data.files;
  } catch (error) {
    console.error("Error fetching folder contents:", (error as Error).message);
    return null;
  }
};

// ✅ Recursively get all files under a folder (including nested ones)
export const getAllFilesRecursive = async (
  folderId: string
): Promise<DriveFile[]> => {
  const allFiles: DriveFile[] = [];

  const fetchFiles = async (id: string) => {
    const children = await getImmediateChildren(id);
    if (!children) return;

    for (const item of children) {
      if (item.mimeType !== "application/vnd.google-apps.folder") {
        allFiles.push(item); // it's a file
        continue;
      }
      if (item.id) await fetchFiles(item.id); // recurse into subfolder
    }
  };

  await fetchFiles(folderId);
  return allFiles;
};
