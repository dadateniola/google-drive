export const listFiles = async (
  folderId: string
): Promise<gapi.client.drive.File[] | null> => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${process.env.NEXT_PUBLIC_API_KEY}`
    );

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await res.json();
    return data.files;
  } catch (error) {
    console.error("Error fetching files:", (error as Error).message);
    return null;
  }
};
