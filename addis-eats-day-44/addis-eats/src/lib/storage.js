import "server-only";

export function getPersistenceMode() {
  const hasUrl = Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim());
  const hasToken = Boolean(process.env.UPSTASH_REDIS_REST_TOKEN?.trim());
  if (hasUrl && hasToken) return "redis";
  return "file";
}

export async function redisCommand(command, ...args) {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!baseUrl || !token) throw new Error("Upstash Redis REST credentials are not configured.");

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command, ...args]),
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok || payload.error) {
    throw new Error(`Redis command failed: ${payload.error || response.statusText}`);
  }
  return payload.result;
}