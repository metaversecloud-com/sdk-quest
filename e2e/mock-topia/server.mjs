// Minimal in-memory fake of the Topia public API (https://<INSTANCE_DOMAIN>/api/v1), covering the
// endpoints @rtsdk/topia calls on behalf of SDK apps. Zero dependencies. When an app calls an
// endpoint that isn't here, the test fails with "public-API calls mock-topia doesn't implement":
// add a route below. Also fakes the S3 API under /s3 (Quest's admin image uploads point
// AWS_ENDPOINT_URL_S3 here, so no test ever reaches real S3).
//
// State is partitioned by urlSlug, so every test seeds its own world and tests can run in parallel.
// Test-only control routes live under /__mock:
//   POST /__mock/worlds/:urlSlug   seed a world  { details, dataObject, assets, visitors }
//   GET  /__mock/worlds/:urlSlug   read world state + event log (particles, toasts, grants, ...)
//   GET  /__mock/users/:profileId  read a user data object
//   GET  /__mock/unhandled         public-API calls the mock didn't recognize, outside any world
//   GET  /__mock/s3                objects in the fake S3 bucket  [{ key, size, contentType }]
//   POST /__mock/s3                add an object  { key, size }
//   GET  /__mock/health

import http from "node:http";

const PORT = Number(process.env.MOCK_TOPIA_PORT || 3101);
const PUBLIC_KEY = process.env.INTERACTIVE_KEY || "e2e-public-key";

// Quest's ecosystem badges (server/controllers/droppedAssets/handleQuestItemClicked.ts).
const INVENTORY_ITEMS = [
  "First Find",
  "3-Day Streak",
  "5-Day Streak",
  "Quest Veteran - Bronze",
  "Quest Veteran - Silver",
  "Quest Veteran - Gold",
  "Quest Veteran - Diamond",
  "Inventory Pro",
].map((name, i) => ({
  id: `badge-${i + 1}`,
  name,
  type: "BADGE",
  status: "ACTIVE",
  description: `${name} badge`,
  image_path: `https://example.invalid/badges/${i + 1}.png`,
}));

const PARTICLES = ["lightBlueSmoke_puff", "redPinkHeart_float", "firework2_gold"].map((name, i) => ({ id: `particle-${i + 1}`, name }));

const EXPRESSIONS = [{ id: "expression-quest_1", name: "quest_1", type: "emote" }];

// Fake S3 bucket, shared by all tests: keys carry the uploader's profileId, which is unique per test.
const s3Objects = new Map();

const worlds = new Map();
const users = new Map();
const unhandledOutsideWorlds = [];
let assetCounter = 0;

const emptyWorld = () => ({
  details: { width: 2000, height: 1500 },
  dataObject: {},
  assets: {},
  visitors: {},
  events: [],
  unhandled: [],
});
const getWorld = (urlSlug) => {
  if (!worlds.has(urlSlug)) worlds.set(urlSlug, emptyWorld());
  return worlds.get(urlSlug);
};
const getUser = (profileId) => {
  if (!users.has(profileId)) users.set(profileId, { dataObject: {} });
  return users.get(profileId);
};

// Mirrors the platform's update-data-object semantics: keys are dot paths, values replace the leaf.
const applyUpdate = (target, updates) => {
  for (const [path, value] of Object.entries(updates || {})) {
    const keys = path.split(".");
    let node = target;
    for (const key of keys.slice(0, -1)) {
      if (typeof node[key] !== "object" || node[key] === null) node[key] = {};
      node = node[key];
    }
    node[keys[keys.length - 1]] = value;
  }
  return target;
};

const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
  });

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body ?? {}));
};

// Analytics ride along on data-object writes ({ dataObject, analytics, lock }); keep them in the event log.
const recordAnalytics = (world, body) => {
  for (const analytic of body.analytics || []) world.events.push({ ...analytic, type: "analytics" });
};

// Data-object routes shared by world, dropped asset, visitor and user.
const dataObjectRoutes = (action, holder, body) => {
  if (action === "get") return clone(holder.dataObject || {});
  if (action === "set") holder.dataObject = clone(body.dataObject) || {};
  if (action === "update") holder.dataObject = applyUpdate(holder.dataObject || {}, clone(body.dataObject));
  return {};
};

const routes = [
  // ---- control plane ----
  ["GET", /^\/__mock\/health$/, () => [200, { ok: true }]],
  [
    "POST",
    /^\/__mock\/worlds\/([^/]+)$/,
    ([urlSlug], body) => {
      worlds.set(urlSlug, { ...emptyWorld(), ...clone(body) });
      return [200, { ok: true }];
    },
  ],
  ["GET", /^\/__mock\/worlds\/([^/]+)$/, ([urlSlug]) => [200, getWorld(urlSlug)]],
  ["GET", /^\/__mock\/users\/([^/]+)$/, ([profileId]) => [200, getUser(profileId)]],
  ["GET", /^\/__mock\/unhandled$/, () => [200, unhandledOutsideWorlds]],
  ["GET", /^\/__mock\/s3$/, () => [200, [...s3Objects.entries()].map(([key, o]) => ({ key, size: o.size, contentType: o.contentType }))]],
  [
    "POST",
    /^\/__mock\/s3$/,
    (_, body) => {
      s3Objects.set(body.key, { size: body.size || 1, contentType: "image/png", lastModified: new Date().toISOString() });
      return [200, { ok: true }];
    },
  ],

  // ---- ecosystem ----
  ["GET", /^\/api\/v1\/inventory\/?$/, () => [200, INVENTORY_ITEMS]],
  [
    "GET",
    /^\/api\/v1\/particles$/,
    (_, __, query) => [200, query.get("name") ? PARTICLES.filter((p) => p.name === query.get("name")) : PARTICLES],
  ],
  ["PUT", /^\/api\/v1\/analytics\/public-key-analytics$/, () => [200, {}]],
  [
    "GET",
    /^\/api\/v1\/expressions$/,
    (_, __, query) => {
      const found = EXPRESSIONS.filter((e) => !query.get("name") || e.name === query.get("name"));
      return found.length ? [200, found] : [404, { message: "No expressions found." }];
    },
  ],

  // ---- users ----
  [
    "GET",
    /^\/api\/v1\/user\/dataObjects\/([^/]+)\/get-data-object$/,
    ([profileId]) => [200, dataObjectRoutes("get", getUser(profileId))],
  ],
  [
    "PUT",
    /^\/api\/v1\/user\/dataObjects\/([^/]+)\/(set|update)-data-object$/,
    ([profileId, action], body) => [200, dataObjectRoutes(action, getUser(profileId), body)],
  ],

  // ---- world ----
  ["GET", /^\/api\/v1\/world\/([^/]+)\/get-data-object$/, ([slug]) => [200, dataObjectRoutes("get", getWorld(slug))]],
  ["GET", /^\/api\/v1\/world\/([^/]+)\/world-details$/, ([slug]) => [200, { urlSlug: slug, ...getWorld(slug).details }]],
  [
    "PUT",
    /^\/api\/v1\/world\/([^/]+)\/fire-toast$/,
    ([slug], body) => {
      getWorld(slug).events.push({ ...body, type: "world-toast" });
      return [200, {}];
    },
  ],
  [
    "PUT",
    /^\/api\/v1\/world\/([^/]+)\/(set|update)-data-object$/,
    ([slug, action], body) => {
      recordAnalytics(getWorld(slug), body);
      return [200, dataObjectRoutes(action, getWorld(slug), body)];
    },
  ],
  [
    "POST",
    /^\/api\/v1\/world\/([^/]+)\/(particles|set-activity|webhooks)$/,
    ([slug, type], body) => {
      // A webhook body carries its own "type" (e.g. webhookZoneEntered); keep it as webhookType.
      getWorld(slug).events.push({ ...body, type, ...(body.type && { webhookType: body.type }) });
      return [200, type === "webhooks" ? { webhookId: `webhook-${++assetCounter}` } : {}];
    },
  ],
  [
    "GET",
    /^\/api\/v1\/world\/([^/]+)\/assets-with-scene-drop-id\/([^/]+)$/,
    ([slug, sceneDropId], _, query) => {
      const uniqueName = query.get("uniqueName");
      const assets = Object.values(getWorld(slug).assets).filter(
        (a) => a.sceneDropId === sceneDropId && (!uniqueName || a.uniqueName === uniqueName),
      );
      return [200, { assets }];
    },
  ],

  // ---- dropped assets ----
  [
    "POST",
    /^\/api\/v1\/world\/([^/]+)\/assets$/,
    ([slug], body) => {
      const id = `dropped-${++assetCounter}`;
      getWorld(slug).assets[id] = { ...body, id, dataObject: {} };
      return [200, { id }];
    },
  ],
  [
    "GET",
    /^\/api\/v1\/world\/([^/]+)\/assets\/([^/]+)\/data-object$/,
    ([slug, id]) => {
      const asset = getWorld(slug).assets[id];
      return asset ? [200, dataObjectRoutes("get", asset)] : [404, { message: "Asset not found" }];
    },
  ],
  [
    "PUT",
    /^\/api\/v1\/world\/([^/]+)\/assets\/([^/]+)\/(set|update)-data-object$/,
    ([slug, id, action], body) => {
      const asset = getWorld(slug).assets[id];
      if (!asset) return [404, { message: "Asset not found" }];
      recordAnalytics(getWorld(slug), body);
      return [200, dataObjectRoutes(action, asset, body)];
    },
  ],
  [
    "GET",
    /^\/api\/v1\/world\/([^/]+)\/assets\/([^/]+)$/,
    ([slug, id]) => {
      const asset = getWorld(slug).assets[id];
      if (!asset) return [404, { message: "Asset not found" }];
      const { dataObject, ...details } = asset;
      return [200, details];
    },
  ],
  [
    "PUT",
    /^\/api\/v1\/world\/([^/]+)\/assets\/([^/]+)\/(set-webhook-zone|set-landmark-zone|set-webimage-layers|change-click-type|set-position)$/,
    ([slug, id, updateType], body) => {
      const world = getWorld(slug);
      const asset = world.assets[id];
      if (!asset) return [404, { message: "Asset not found" }];
      Object.assign(asset, body);
      world.events.push({ ...body, type: updateType, assetId: id });
      const { dataObject, ...details } = asset;
      return [200, details];
    },
  ],
  [
    "DELETE",
    /^\/api\/v1\/world\/([^/]+)\/assets\/([^/]+)$/,
    ([slug, id]) => {
      const world = getWorld(slug);
      delete world.assets[id];
      world.events.push({ type: "delete-asset", assetId: id });
      return [200, {}];
    },
  ],

  // ---- visitors ----
  [
    "GET",
    /^\/api\/v1\/world\/([^/]+)\/visitors\/([^/]+)$/,
    ([slug, id]) => {
      const visitor = getWorld(slug).visitors[id];
      if (!visitor) return [404, { message: "Visitor not found" }];
      const { dataObject, inventory, ...details } = visitor;
      return [200, { ...details, visitorId: Number(id), profile: { profileId: visitor.profileId } }];
    },
  ],
  [
    "GET",
    /^\/api\/v1\/world\/([^/]+)\/visitors\/([^/]+)\/get-data-object$/,
    ([slug, id]) => {
      const visitor = getWorld(slug).visitors[id];
      return visitor ? [200, dataObjectRoutes("get", visitor)] : [404, { message: "Visitor not found" }];
    },
  ],
  [
    "PUT",
    /^\/api\/v1\/world\/([^/]+)\/visitors\/([^/]+)\/(set|update)-data-object$/,
    ([slug, id, action], body) => {
      const visitor = getWorld(slug).visitors[id];
      if (!visitor) return [404, { message: "Visitor not found" }];
      recordAnalytics(getWorld(slug), body);
      return [200, dataObjectRoutes(action, visitor, body)];
    },
  ],
  [
    "GET",
    /^\/api\/v1\/world\/([^/]+)\/visitors\/([^/]+)\/get-visitor-inventory-items$/,
    // Like the public API, the item's name/type/image are also flattened onto each owned entry.
    ([slug, id]) => [
      200,
      (getWorld(slug).visitors[id]?.inventory || []).map((owned) => ({
        name: owned.item?.name,
        type: owned.item?.type,
        image_url: owned.item?.image_url,
        ...owned,
      })),
    ],
  ],
  [
    "PUT",
    /^\/api\/v1\/world\/([^/]+)\/visitors\/([^/]+)\/grant-visitor-inventory-item$/,
    ([slug, id], body) => {
      const world = getWorld(slug);
      const visitor = world.visitors[id];
      const item = INVENTORY_ITEMS.find((i) => i.id === body.itemId);
      if (!visitor || !item) return [404, { message: "Visitor or item not found" }];
      const granted = { id: `user-item-${++assetCounter}`, item_id: item.id, status: "ACTIVE", quantity: body.quantity, item: { ...item, image_url: item.image_path } };
      visitor.inventory = [...(visitor.inventory || []), granted];
      world.events.push({ type: "grant-item", visitorId: id, name: item.name });
      return [200, { inventoryItem: item.id, user_id: visitor.profileId, quantity: body.quantity }];
    },
  ],
  [
    "PUT",
    /^\/api\/v1\/world\/([^/]+)\/visitors\/([^/]+)\/grant-expression\/([^/]+)$/,
    ([slug, id, expressionId]) => {
      const world = getWorld(slug);
      const visitor = world.visitors[id];
      const expression = EXPRESSIONS.find((e) => e.id === expressionId);
      if (!visitor || !expression) return [404, { message: "Visitor or expression not found" }];
      // Like the public API: a repeat grant still answers 200, with the serialized ApiError as the body.
      if ((visitor.expressions || []).includes(expression.name)) return [200, { statusCode: 409 }];
      visitor.expressions = [...(visitor.expressions || []), expression.name];
      world.events.push({ type: "grant-expression", visitorId: id, name: expression.name });
      return [200, { success: true }];
    },
  ],
  [
    "PUT",
    /^\/api\/v1\/world\/([^/]+)\/visitors\/([^/]+)\/(move|fire-toast|open-iframe|close-iframe)$/,
    ([slug, id, type], body) => {
      getWorld(slug).events.push({ ...body, type, visitorId: id });
      return [200, {}];
    },
  ],
];

// Decodes (without verifying) the InteractiveJWT the SDK signs with the app's secret.
const jwtPayload = (req) => {
  try {
    return JSON.parse(Buffer.from(String(req.headers.interactivejwt).split(".")[1], "base64url").toString());
  } catch {
    return undefined;
  }
};

// ---- S3 (path-style: /s3/<bucket>/<key>) ----
const readRaw = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

const xmlEscape = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const handleS3 = async (req, res, url) => {
  const [bucket, ...keyParts] = url.pathname.slice("/s3/".length).split("/");
  const key = decodeURIComponent(keyParts.join("/"));
  const raw = await readRaw(req);

  if (req.method === "PUT" && key) {
    s3Objects.set(key, { size: raw.length, contentType: req.headers["content-type"], lastModified: new Date().toISOString() });
    res.writeHead(200, { ETag: '"e2e"' });
    return res.end();
  }
  if (req.method === "DELETE" && key) {
    s3Objects.delete(key);
    res.writeHead(204);
    return res.end();
  }
  if (req.method === "GET" && !key) {
    const prefix = url.searchParams.get("prefix") || "";
    const contents = [...s3Objects.entries()]
      .filter(([k]) => k.startsWith(prefix))
      .map(
        ([k, o]) =>
          `<Contents><Key>${xmlEscape(k)}</Key><LastModified>${o.lastModified}</LastModified><ETag>"e2e"</ETag><Size>${o.size}</Size><StorageClass>STANDARD</StorageClass></Contents>`,
      )
      .join("");
    res.writeHead(200, { "Content-Type": "application/xml" });
    return res.end(
      `<?xml version="1.0" encoding="UTF-8"?><ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>${xmlEscape(bucket)}</Name><Prefix>${xmlEscape(prefix)}</Prefix><MaxKeys>1000</MaxKeys><IsTruncated>false</IsTruncated>${contents}</ListBucketResult>`,
    );
  }

  console.error(`[mock-topia] unhandled S3 ${req.method} ${url.pathname}`);
  unhandledOutsideWorlds.push(`S3 ${req.method} ${url.pathname}`);
  res.writeHead(501);
  res.end();
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith("/s3/")) return await handleS3(req, res, url);
    const body = ["POST", "PUT", "DELETE"].includes(req.method) ? await readBody(req) : {};

    if (url.pathname.startsWith("/api/") && req.headers.publickey !== PUBLIC_KEY) {
      return send(res, 401, { message: "Invalid PublicKey header" });
    }
    // World routes need the visitor's signed credentials (or an API key), like the public API, which
    // rejects a JWT without an interactive nonce. The SDK signs whatever credentials the app passed.
    if (url.pathname.startsWith("/api/v1/world/") && !req.headers.authorization && !jwtPayload(req)?.interactiveNonce) {
      return send(res, 401, { message: "Missing interactive credentials" });
    }

    for (const [method, pattern, handler] of routes) {
      if (method !== req.method) continue;
      const match = url.pathname.match(pattern);
      if (!match) continue;
      const [status, payload] = handler(match.slice(1).map(decodeURIComponent), body, url.searchParams);
      return send(res, status, payload);
    }

    // Surfaces endpoints the app started calling that this mock doesn't know about yet; the e2e
    // fixture fails the test that triggered one.
    console.error(`[mock-topia] unhandled ${req.method} ${url.pathname}`);
    const call = `${req.method} ${url.pathname}`;
    const worldSlug = url.pathname.match(/^\/api\/v1\/world\/([^/]+)\//)?.[1];
    if (worldSlug) getWorld(decodeURIComponent(worldSlug)).unhandled.push(call);
    else unhandledOutsideWorlds.push(call);
    send(res, 501, { message: `mock-topia: unhandled ${req.method} ${url.pathname}` });
  } catch (error) {
    console.error("[mock-topia] error", error);
    send(res, 500, { message: String(error) });
  }
});

server.listen(PORT, () => console.log(`[mock-topia] listening on http://localhost:${PORT}`));
