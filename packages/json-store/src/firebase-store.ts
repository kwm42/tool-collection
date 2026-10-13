import {
  initializeApp,
  getApps,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import {
  getDatabase,
  ref,
  get as getValue,
  set as setValue,
  remove as removeValue,
  type Database,
} from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

import type { FirebaseStoreOptions, JsonStore } from "./types.js";

interface Ready {
  app: FirebaseApp;
  db: Database;
}

const instances = new Map<string, Promise<Ready>>();

const getReady = (config: FirebaseOptions, appName: string): Promise<Ready> => {
  const cached = instances.get(appName);
  if (cached) {
    return cached;
  }

  const ready = (async () => {
    const app =
      getApps().find((existing) => existing.name === appName) ??
      initializeApp(config, appName);
    const db = getDatabase(app);
    const auth = getAuth(app);
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return { app, db };
  })();

  instances.set(appName, ready);
  return ready;
};

export class FirebaseStore implements JsonStore {
  private readonly config: FirebaseOptions;
  private readonly basePath: string;
  private readonly appName: string;

  constructor(options: FirebaseStoreOptions) {
    this.config = options.config;
    this.basePath = options.basePath;
    this.appName = options.appName ?? "[DEFAULT]";
  }

  private async node() {
    const { db } = await getReady(this.config, this.appName);
    return ref(db, this.basePath);
  }

  async get<T>(): Promise<T | null> {
    const snapshot = await getValue(await this.node());
    return snapshot.exists() ? (snapshot.val() as T) : null;
  }

  async save<T>(data: T): Promise<void> {
    await setValue(await this.node(), data);
  }

  async remove(): Promise<void> {
    await removeValue(await this.node());
  }
}
