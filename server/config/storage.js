import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

let s3Client;
export const getS3Client = () => {
  if (s3Client) return s3Client;
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
  s3Client = new S3Client({ region });
  return s3Client;
};

export const getCdnBaseUrl = () => process.env.CDN_BASE_URL || "https://d21nrr522d71h7.cloudfront.net";

export const uploadBufferToS3 = async ({ buffer, contentType, bucket = process.env.S3_BUCKET_NAME, keyPrefix = "uploads/" }) => {
  if (!bucket) throw new Error("S3_BUCKET_NAME is not configured");
  const key = `${keyPrefix}${randomUUID()}`;
  const client = getS3Client();
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType });
  await client.send(cmd);
  const base = getCdnBaseUrl();
  return `${base}/${key}`;
};

