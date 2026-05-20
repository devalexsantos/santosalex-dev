/**
 * POST /api/admin/upload
 *
 * Admin-only. Accepts a single image file via multipart/form-data (field
 * name "file"), uploads it to S3, and returns its public URL.
 *
 * Response: { url: string } | { error: string }
 */
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin-session";
import {
  uploadToS3,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Auth — return 401 instead of redirecting (this is an API route).
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Tipo de arquivo não suportado. Use JPG, PNG, WebP, AVIF ou GIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande. Tamanho máximo: 5 MB." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `projects/${randomUUID()}.${ext}`;

  try {
    const url = await uploadToS3(buffer, key, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload] S3 upload failed:", err);
    return NextResponse.json(
      { error: "Falha ao enviar o arquivo. Tente novamente." },
      { status: 500 }
    );
  }
}
