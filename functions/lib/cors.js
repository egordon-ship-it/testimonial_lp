/**
 * CORS helpers for HTTPS functions (browser fetch from hosting origin).
 */

const ALLOWED_HEADERS = "Content-Type, Authorization";

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Credentials", "true");
  } else {
    res.set("Access-Control-Allow-Origin", "*");
  }
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  res.set("Access-Control-Max-Age", "3600");
}

function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    applyCors(req, res);
    res.status(204).send("");
    return true;
  }
  return false;
}

module.exports = { applyCors, handleOptions };
