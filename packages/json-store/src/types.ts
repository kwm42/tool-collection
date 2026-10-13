import type { FirebaseOptions } from "firebase/app";

export interface JsonStore {
  get<T>(): Promise<T | null>;
  save<T>(data: T): Promise<void>;
  remove(): Promise<void>;
}

export interface FirebaseStoreOptions {
  config: FirebaseOptions;
  basePath: string;
  appName?: string;
}
