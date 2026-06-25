/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { upload } from "@vercel/blob/client";
import { getAudioDuration, getVideoDuration, captureVideoThumbnail } from "./mediaMetadata";

export type PortalUploadType = "track" | "playlist" | "photo" | "video" | "layout" | "doc";

const PRIVATE_TYPES = new Set<PortalUploadType>(["track", "doc"]);
const HANDLE_UPLOAD_URL = "/api/portal/upload";

export interface PortalUploadInput {
  file: File;
  type: PortalUploadType;
  title?: string;
  description?: string;
  rightsConfirmed: boolean;
  onProgress?: (percentage: number) => void;
}

async function uploadThumbnail(file: File): Promise<string | undefined> {
  const thumbBlob = await captureVideoThumbnail(file);
  if (!thumbBlob) return undefined;

  const thumbFile = new File([thumbBlob], `${file.name.replace(/\.[^.]+$/, "")}-thumb.jpg`, { type: "image/jpeg" });
  const result = await upload(`portal-thumbnails/${Date.now()}-${thumbFile.name}`, thumbFile, {
    access: "public",
    handleUploadUrl: HANDLE_UPLOAD_URL,
    clientPayload: JSON.stringify({
      type: "photo",
      fileSize: thumbFile.size,
      mimeType: thumbFile.type,
      rightsConfirmed: true,
      isThumbnail: true,
    }),
  });

  return result.url;
}

export async function uploadPortalAvatar(file: File): Promise<string> {
  const result = await upload(`portal-avatars/${Date.now()}-${file.name}`, file, {
    access: "public",
    handleUploadUrl: HANDLE_UPLOAD_URL,
    clientPayload: JSON.stringify({
      type: "photo",
      fileSize: file.size,
      mimeType: file.type,
      rightsConfirmed: true,
      isThumbnail: true,
    }),
  });

  return result.url;
}

export async function uploadPortalFile(input: PortalUploadInput) {
  const { file, type, title, description, rightsConfirmed, onProgress } = input;

  let duration: number | undefined;
  let thumbnailUrl: string | undefined;

  if (type === "track") {
    duration = await getAudioDuration(file);
  } else if (type === "video") {
    duration = await getVideoDuration(file);
    thumbnailUrl = await uploadThumbnail(file);
  }

  const access = PRIVATE_TYPES.has(type) ? "private" : "public";

  const blob = await upload(`portal/${type}/${Date.now()}-${file.name}`, file, {
    access,
    handleUploadUrl: HANDLE_UPLOAD_URL,
    multipart: file.size > 10 * 1024 * 1024,
    onUploadProgress: onProgress ? (event) => onProgress(event.percentage) : undefined,
    clientPayload: JSON.stringify({
      type,
      title,
      description,
      duration,
      thumbnailUrl,
      fileSize: file.size,
      mimeType: file.type,
      rightsConfirmed,
    }),
  });

  return blob;
}
