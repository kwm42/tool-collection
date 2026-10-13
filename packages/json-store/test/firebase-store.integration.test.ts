import { afterAll, describe, expect, it } from "vitest";
import type { FirebaseOptions } from "firebase/app";

import { FirebaseStore } from "../src/index.js";

const readConfig = (): FirebaseOptions => {
  const config: FirebaseOptions = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  if (!config.apiKey || !config.databaseURL) {
    throw new Error(
      "缺少 Firebase 配置：请将 .env.test.local.example 复制为 .env.test.local 并填入 FIREBASE_API_KEY 与 FIREBASE_DATABASE_URL",
    );
  }

  return config;
};

const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const config = readConfig();
const basePath = `${process.env.FIREBASE_TEST_PATH ?? "configs/__tests__"}/${runId}`;

const store = new FirebaseStore({
  config,
  basePath,
  appName: `json-store-test-${runId}`,
});

afterAll(async () => {
  await store.remove();
});

describe("FirebaseStore (集成测试)", () => {
  it("未写入时 get 返回 null", async () => {
    expect(await store.get()).toBeNull();
  });

  it("save 后 get 能取回相同数据", async () => {
    const data = { hello: "world", count: 42, nested: { list: [1, 2, 3] } };
    await store.save(data);
    expect(await store.get()).toEqual(data);
  });

  it("再次 save 会覆盖旧值", async () => {
    await store.save({ version: 2 });
    expect(await store.get()).toEqual({ version: 2 });
  });

  it("remove 后 get 返回 null", async () => {
    await store.remove();
    expect(await store.get()).toBeNull();
  });
});
