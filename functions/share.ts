import { KVNamespace, R2Bucket, PagesFunction } from "@cloudflare/workers-types";

interface Env {
  ORBAT_SCENARIO_BUCKET: R2Bucket;
  LIMITER_KV: KVNamespace;
  UPLOAD_SECRET: string;
}

/**
 * Checks if the given origin is allowed for CORS and uploads.
 * Allowed origins:
 * - https://orbat-mapper.app (production)
 * - https://*.orbat-mapper.pages.dev (Cloudflare Pages previews)
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (origin === "https://orbat-mapper.app") return true;
  // Match *.orbat-mapper.pages.dev subdomains
  const pagesDevPattern = /^https:\/\/[a-z0-9-]+\.orbat-mapper\.pages\.dev$/;
  return pagesDevPattern.test(origin);
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const origin = request.headers.get("Origin");

  // Determine allowed origin for CORS headers
  const allowedOrigin = isAllowedOrigin(origin) ? origin : "https://orbat-mapper.app";

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin!,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-ORBAT-SECRET",
  };

  // 1. Handle CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 2. GET: Load Scenario
  if (request.method === "GET" && id) {
    const object = await env.ORBAT_SCENARIO_BUCKET.get(id);

    if (!object) {
      return new Response(JSON.stringify({ error: "Map Not Found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const headers = new Headers(corsHeaders);
    object.writeHttpMetadata(headers);
    headers.set("Last-Modified", object.uploaded.toUTCString());
    headers.set("Cache-Control", "public, max-age=604800"); // 7-day TTL for Cache Rules

    return new Response(object.body, { headers });
  }

  // 3. POST: Secure Upload & Rate Limiting
  if (request.method === "POST") {
    const secret = request.headers.get("X-ORBAT-SECRET");

    // Security Verification: Origin & Shared Secret
    if (!isAllowedOrigin(origin)) {
      return new Response("Forbidden: Invalid Origin", { status: 403 });
    }
    if (secret !== env.UPLOAD_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Rate Limiting: 20 uploads per hour per IP
    const ratelimitKey = `limit:${ip}`;
    const usageStr = await env.LIMITER_KV.get(ratelimitKey);
    const usage = parseInt(usageStr || "0");

    if (usage >= 20) {
      return new Response(JSON.stringify({ error: "Hourly upload limit reached." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      // Size Validation: Check header first, then actual body
      const contentLength = parseInt(request.headers.get("content-length") || "0");
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB

      if (contentLength > MAX_SIZE) {
        return new Response("Payload too large", { status: 413 });
      }

      // Read body as ArrayBuffer to verify actual size
      const bodyBuffer = await request.arrayBuffer();
      if (bodyBuffer.byteLength > MAX_SIZE) {
        return new Response("Payload too large", { status: 413 });
      }

      // Convert back to string for storage (assuming JSON)
      const bodyString = new TextDecoder().decode(bodyBuffer);
      const uniqueId = crypto.randomUUID();

      // Store in R2
      await env.ORBAT_SCENARIO_BUCKET.put(uniqueId, bodyString, {
        httpMetadata: { contentType: "application/json" },
      });

      // Update Rate Limiter (Expiring in 1 hour)
      await env.LIMITER_KV.put(ratelimitKey, (usage + 1).toString(), {
        expirationTtl: 3600,
      });

      return new Response(JSON.stringify({ id: uniqueId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response("Invalid request", { status: 400 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
