/**
 * Shared HubSpot CRM API fetch (Bearer token).
 */

const HUBSPOT_API = "https://api.hubapi.com";

async function hubspotFetch(path, accessToken, options = {}) {
  const url = path.startsWith("http") ? path : `${HUBSPOT_API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  return { ok: res.ok, status: res.status, data };
}

module.exports = { HUBSPOT_API, hubspotFetch };
