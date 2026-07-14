import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyD3wXNvZEiGBNdQIN9k_jYxZx5GVI4zFBg",
  authDomain: "instnat-website.firebaseapp.com",
  projectId: "instnat-website",
  storageBucket: "instnat-website.firebasestorage.app",
  messagingSenderId: "46236959424",
  appId: "1:46236959424:web:8e044c5d4f02e6703ee325"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  try {
    const docRef = doc(db, 'portfolios', 'ovaise-shaikh');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Document fields:", Object.keys(data));
      console.log("Theme:", data.th);
      console.log("Name:", data.n);
      console.log("Slug:", data.slug);
      
      const html = data.customHtml || "";
      console.log("HTML Length:", html.length);
      console.log("Contains script observer?", html.includes('MutationObserver'));
      console.log("Contains replaceWordCaseInsensitive?", html.includes('replaceWordCaseInsensitive'));
      console.log("Contains 'Gufran' in static text?", html.includes('Gufran'));
      
      // Save it to a file so we can view the HTML
      fs.writeFileSync('fetched_ovaise_shaikh.html', html);
      console.log("Saved HTML to fetched_ovaise_shaikh.html");
    } else {
      console.log("Document 'ovaise-shaikh' does not exist!");
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

check();
