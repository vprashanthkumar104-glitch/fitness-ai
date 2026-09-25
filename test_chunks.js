import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, terminate } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const snap = await getDocs(collection(db, "knowledge_chunks"));
  for (const doc of snap.docs) {
    console.log(`\n=== CHUNK: ${doc.id} ===`);
    console.log(`Doc: ${doc.data().docName}`);
    console.log(`Length: ${doc.data().text?.length}`);
    console.log(`Text: ${doc.data().text}`);
  }
  await terminate(db);
}
check();
