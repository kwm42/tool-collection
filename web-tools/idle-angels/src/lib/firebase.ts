import { FirebaseStore } from "@tool-collection/json-store";

export const firebaseConfig = {
  apiKey: "AIzaSyD6J0Fz6w4GxgLCimnIttK3soiUfbplLBo",
  authDomain: "oso-buddy.firebaseapp.com",
  databaseURL:
    "https://oso-buddy-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "oso-buddy",
  storageBucket: "oso-buddy.firebasestorage.app",
  messagingSenderId: "146066487696",
  appId: "1:146066487696:web:f50fba86b29cd906f2db15",
};

export const store = new FirebaseStore({
  config: firebaseConfig,
  basePath: "configs/idle-angels",
  appName: "idle-angels",
});
