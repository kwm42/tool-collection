import { Client, Workflow, outToB64Urls } from "@stable-canvas/comfyui-client";
import WebSocket from "ws";
import fetch from "node-fetch";

const COMFYUI_HOST = "127.0.0.1:8188";

async function basicTest() {
  console.log("=== Basic Test: Client Connection ===\n");

  const client = new Client({
    api_host: COMFYUI_HOST,
    WebSocket,
    fetch,
  });

  try {
    console.log("Connecting to ComfyUI...");
    const [stats, isConnected] = await Promise.all([
      client.getSystemStats(),
      client.connect(),
    ]);

    console.log("System Stats:", stats);
    console.log("WebSocket Connected:", isConnected);

    console.log("\nFetching available models...");
    const models = await client.getSDModels();
    console.log(`Found ${models.length} models`);
    if (models.length > 0) {
      console.log("First model:", models[0].name);
    }

    console.log("\n=== Test Complete ===");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    client.close();
  }
}

basicTest();