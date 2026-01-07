/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

export async function getPresignedDownloadUrl(key: string) {
    if (!process.env.AWS_ACCESS_KEY_ID) {
        // Return a mock URL if no AWS config
        return `https://mock-s3-bucket.s3.amazonaws.com/${key}?mock-token=123`;
    }

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
    });

    try {
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
        console.error("Error generating presigned URL", error);
        throw error;
    }
}

import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadFile(
    key: string,
    body: Buffer,
    contentType: string
): Promise<string> {
    if (!process.env.AWS_ACCESS_KEY_ID) {
        // Return a mock URL if no AWS config
        return `https://mock-s3-bucket.s3.amazonaws.com/${key}`;
    }

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: "public-read", // Optional: depending on bucket policy
    });

    try {
        await s3Client.send(command);
        // Return standard S3 URL
        return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
    } catch (error) {
        console.error("Error uploading file to S3", error);
        throw error;
    }
}
