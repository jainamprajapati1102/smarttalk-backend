import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "AKIA5TPRJCICQTKHP4PE",
    secretAccessKey: "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",
  },
});
