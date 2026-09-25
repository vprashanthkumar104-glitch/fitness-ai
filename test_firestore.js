import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, terminate } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  try {
    const snap = await getDocs(collection(db, "knowledge_documents"));
    console.log("Documents in Firestore count:", snap.size);
    for (const d of snap.docs) {
      console.log("DOC_ID:", d.id);
      console.log("DOC_DATA:", JSON.stringify(d.data()));
    }
    const chunksSnap = await getDocs(collection(db, "knowledge_chunks"));
    console.log("Chunks in Firestore count:", chunksSnap.size);
    for (const c of chunksSnap.docs) {
      console.log("CHUNK_ID:", c.id, c.data().docName, c.data().text?.slice(0, 100));
    }
  } catch (err) {
    console.error("Firestore error:", err);
  } finally {
    await terminate(db);
    process.exit(0);
  }
}
check();
