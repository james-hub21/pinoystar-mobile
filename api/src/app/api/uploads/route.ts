import type { NextRequest } from 'next/server';
import { ApiError, badRequest, json, route } from '@/lib/http';
import { requireAuth } from '@/lib/supabase';

const MAX_BYTES = 5 * 1024 * 1024;

/** Identify the real image type from its magic bytes — never trust the client's MIME claim. */
function sniff(bytes: Uint8Array): { mime: string; ext: string } | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { mime: 'image/png', ext: 'png' };
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return { mime: 'image/webp', ext: 'webp' };
  return null;
}

// POST /api/uploads — multipart `file` (JPEG/PNG/WebP ≤ 5 MB) → { url }
export const POST = route(async (req: NextRequest) => {
  const auth = await requireAuth(req);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw badRequest('Send the image as multipart/form-data with a "file" field.');
  }
  const file = form.get('file');
  if (!(file instanceof File)) throw badRequest('Attach an image in the "file" field.');
  if (file.size === 0) throw badRequest('That image is empty.');
  if (file.size > MAX_BYTES) throw new ApiError(413, 'too_large', 'Photos must be 5 MB or smaller.');

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) throw new ApiError(415, 'unsupported_type', 'Use a JPEG, PNG or WebP photo.');

  const path = `${auth.userId}/${crypto.randomUUID()}.${kind.ext}`;
  const storage = auth.client.storage.from('media');
  const { error } = await storage.upload(path, bytes, { contentType: kind.mime, upsert: false });
  if (error) {
    console.error('[upload]', error);
    throw new ApiError(502, 'upload_failed', 'We couldn’t save that photo. Please try again.');
  }
  return json({ url: storage.getPublicUrl(path).data.publicUrl }, 201);
});
