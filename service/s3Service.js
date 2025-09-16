// services/s3Service.js
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3Client.js"; // your S3 client export

export async function getPresignedUrlForKey(key, expiresIn = 3600) {
  if (!key || typeof key !== "string") {
    console.warn("Skipping presign — invalid key:", key);
    return null;
  }
  const cmd = new GetObjectCommand({
    Bucket: 'smarttalks',
    Key: key,
  });
  return getSignedUrl(s3, cmd, { expiresIn });
}
