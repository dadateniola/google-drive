"use client";

import Image from "next/image";
import React, { useState } from "react";

// Images
import { Loader } from "lucide-react";

// Imports
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getAllFilesRecursive } from "@/lib/google";

// Schema
const folderLinkSchema = z
  .string()
  .nonempty("Please enter a folder link")
  .regex(
    /^https:\/\/drive\.google\.com\/drive\/folders\/([\w-]+)(\?.*)?$/,
    "Please enter a valid Google Drive folder link"
  );

const Home = () => {
  // States
  const [folderLink, setFolderLink] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Functions
  const fetchImages = async (folderId: string) => {
    const files = await getAllFilesRecursive(folderId);

    if (!files) {
      setSuccess(null);
      setIsValidated(false);
      setError("Failed to fetch images from the folder.");
      return;
    }

    const imageUrls = files
      .filter((file) => file.mimeType?.startsWith("image/"))
      .map((file) => `https://drive.google.com/uc?id=${file.id}`);

    setSuccess("Images fetched successfully!");
    setImages(imageUrls);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form submission

    const result = folderLinkSchema.safeParse(folderLink.trim());

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    const match = folderLink.match(
      /^https:\/\/drive\.google\.com\/drive\/folders\/([\w-]+)/
    );

    const folderId = match?.[1];

    if (!folderId) {
      setError("Could not extract folder ID from link.");
      return;
    }

    // All good — folder ID extracted
    setIsValidated(true);
    setError(null);

    // Fetch images
    setSuccess(`Fetching images from folder: ${folderId}`);
    setTimeout(() => {
      fetchImages(folderId);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderLink(e.target.value);
    setError(null); // Clear error when input changes
  };

  return images.length ? (
    <main className="w-full h-full p-5 sm:p-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {images.map((image, index) => (
        <div
          key={index}
          className="relative w-full aspect-square group overflow-hidden"
        >
          <Image
            src={image}
            alt="Image from Google Drive"
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover bg-accent transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ))}
    </main>
  ) : (
    <main className="w-full h-screen custom-flex-center">
      <div className="w-[min(400px,95vw)] custom-flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
          <div className="flex-1 custom-flex-col gap-3">
            <Label htmlFor="folder-link">Public Drive Folder URL</Label>
            <Input
              type="text"
              id="folder-link"
              placeholder="https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j"
              value={folderLink}
              onChange={handleInputChange}
              className="flex-1 py-2"
            />
          </div>
          <Button
            type="submit"
            disabled={!!error || isValidated}
            className="cursor-pointer"
          >
            {isValidated ? (
              <>
                <Loader className="animate-spin" />
                Loading..
              </>
            ) : (
              "Get images"
            )}
          </Button>
        </form>
        <div className="relative">
          {error && (
            <p className="absolute top-0 left-0 w-full px-1 text-red-400 text-sm font-normal">
              {error}
            </p>
          )}
          {success && (
            <p className="absolute top-0 left-0 w-full px-1 text-green-400 text-sm font-normal">
              {success}
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
