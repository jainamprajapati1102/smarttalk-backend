// s3Utils.js
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3Client.js";

export const getPresignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: "smarttalks",
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
};
