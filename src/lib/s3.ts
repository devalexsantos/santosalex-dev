import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const globalForS3 = globalThis as unknown as {
  s3: S3Client | undefined;
};

function getRegion(): string {
  const region = process.env.AWS_REGION;
  if (!region) throw new Error("AWS_REGION is not set");
  return region;
}

function getBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error("AWS_S3_BUCKET is not set");
  return bucket;
}

function createClient(): S3Client {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are not set");
  }
  return new S3Client({
    region: getRegion(),
    credentials: { accessKeyId, secretAccessKey },
  });
}

// Lazy: the client is built on first use (request time), never at module load.
// This keeps `next build` from evaluating AWS env vars, which aren't present
// during the Docker build (they're injected at runtime by the host).
function getS3(): S3Client {
  globalForS3.s3 ??= createClient();
  return globalForS3.s3;
}

// Allowed image MIME types → file extension. The extension is derived from the
// validated content type (never the client filename) to avoid key injection.
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Uploads a buffer to S3 under `projects/<key>` and returns its public URL.
 * Assumes the bucket serves objects publicly (via bucket policy or ACL).
 */
export async function uploadToS3(
  body: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const bucket = getBucket();
  const region = getRegion();

  await getS3().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
