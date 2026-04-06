const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID!;
const CF_API_TOKEN = process.env.CF_API_TOKEN!;

const KV_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}`;

export async function kvPut(shortCode: string, destinationUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${KV_BASE}/values/${shortCode}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
      body: destinationUrl,
    });
    return res.ok;
  } catch (err) {
    console.error('KV PUT failed:', err);
    return false;
  }
}

export async function kvDelete(shortCode: string): Promise<boolean> {
  try {
    const res = await fetch(`${KV_BASE}/values/${shortCode}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
    });
    return res.ok;
  } catch (err) {
    console.error('KV DELETE failed:', err);
    return false;
  }
}
