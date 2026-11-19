/**
 * odoo-image.ts — build streaming URLs for Odoo binary/Image fields.
 *
 * Odoo stores `fields.Image` / `fields.Binary(attachment=True)` values in the filestore and
 * serves them through `/web/image`. Reading them as base64 over JSON-RPC multiplies the
 * payload by ~1.33 and blocks the main thread, so the client requests bytes from our own
 * proxy route instead and lets the browser cache them.
 */

export type OdooImageSize = '128' | '256' | '512' | '1024' | '1920'

export function odooImageUrl(model: string, id: number, field: string, size: OdooImageSize = '256'): string {
  return `/api/odoo/image/${model}/${id}/${field}?size=${size}`
}
