import { config } from "dotenv";

config({ path: ".env.test.local", quiet: true });

const proxyUrl =
  process.env.HTTPS_PROXY ??
  process.env.HTTP_PROXY ??
  process.env.ALL_PROXY;

if (proxyUrl) {
  const { ProxyAgent } = await import("undici");
  Object.assign(globalThis, {
    [Symbol.for("undici.globalDispatcher.1")]: new ProxyAgent(proxyUrl),
  });
}
