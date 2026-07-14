import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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

const originalWords = ["Muhammad", "Gufran"];
const userData = {
  name: "Ovaise Shaikh",
  title: "DevOps Engineer",
  bio: "Ovaise Shaikh is a DevOps Engineer with 1 year of experience at Infohybrid. He has setup dev and production environments, mastered Kubernetes, Docker, Terraform, GCP, Azure, and AWS CI/CD pipelines.",
  skills: ["Kubernetes", "Docker", "Terraform", "Git", "GCP", "Azure", "AWS", "YAML", "Python", "CI/CD"],
  projects: [],
  experience: []
};
const originalTitleText = "Backend Developer & GenAI Specialist";

const compilePureString = (html) => {
  let outputHtml = html;
  
  // Also manually perform static replacements if they are not already done
  if (outputHtml.includes('Muhammad')) {
    outputHtml = outputHtml.replace(/Muhammad/g, 'Ovaise');
  }
  if (outputHtml.includes('Gufran')) {
    outputHtml = outputHtml.replace(/Gufran/g, 'Shaikh');
  }
  
  const injectedScript = `
<script>
      (function() {
        console.log("[MUTATION-OBSERVER] Initializing DOM hijacking script...");
        const originalWords = ${JSON.stringify(originalWords)};
        const newName = ${JSON.stringify(userData.name)};
        const originalTitle = ${JSON.stringify(originalTitleText)};
        const newTitle = ${JSON.stringify(userData.title)};
        const newBio = ${JSON.stringify(userData.bio)};
        const newSkills = ${JSON.stringify(userData.skills || [])};

        const replaceWordCaseInsensitive = (text, search, replacement) => {
          if (!search || !text) return text;
          let out = "";
          let pos = 0;
          const searchLower = search.toLowerCase();
          const textLower = text.toLowerCase();
          
          while (true) {
            const idx = textLower.indexOf(searchLower, pos);
            if (idx === -1) {
              out += text.slice(pos);
              break;
            }
            const charBefore = idx > 0 ? text[idx - 1] : "";
            const charAfter = idx + search.length < text.length ? text[idx + search.length] : "";
            
            const isBoundaryBefore = !charBefore || /[^a-zA-Z0-9]/.test(charBefore);
            const isBoundaryAfter = !charAfter || /[^a-zA-Z0-9]/.test(charAfter);
            
            if (isBoundaryBefore && isBoundaryAfter) {
              out += text.slice(pos, idx) + replacement;
            } else {
              out += text.slice(pos, idx + search.length);
            }
            pos = idx + search.length;
          }
          return out;
        };

        const replaceTextContent = (text) => {
          if (!text) return text;
          let out = text;
          if (newName) {
            const newWords = newName.split(/\\s+/).filter(w => w.length > 1);
            originalWords.forEach((word, idx) => {
              const replacementText = newWords[idx] !== undefined ? newWords[idx] : "";
              out = replaceWordCaseInsensitive(out, word, replacementText);
            });
          }
          if (originalTitle && originalTitle.length > 3 && newTitle) {
            out = replaceWordCaseInsensitive(out, originalTitle, newTitle);
          }
          return out;
        };

        const processNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const replaced = replaceTextContent(node.nodeValue);
            if (replaced !== node.nodeValue) {
              node.nodeValue = replaced;
            }
          } else {
            if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
              node.childNodes.forEach(processNode);
            }
          }
        };

        const injectSpecialDetails = () => {
          if (newBio) {
            const leafBlocks = Array.from(document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')).filter(el => {
              return el.children.length === 0 && el.innerText.trim().length > 50 && el.innerText.trim().length < 500;
            }).sort((a, b) => b.innerText.trim().length - a.innerText.trim().length);
            if (leafBlocks.length > 0 && leafBlocks[0].innerText !== newBio) {
              leafBlocks[0].innerText = newBio;
            }
          }

          if (newSkills && newSkills.length > 0) {
            const commonSkills = ["react", "javascript", "html", "css", "node", "python", "java", "aws", "docker", "kubernetes", "git", "figma", "ui/ux", "devops", "sql", "nosql", "ci/cd", "tailwind", "cloud architecture", "azure", "gcp", "google cloud", "terraform"];
            const skillElements = Array.from(document.querySelectorAll('span, li, div, h3, h4, h5')).filter(el => {
              const text = el.innerText.trim().toLowerCase();
              return text && text.length > 1 && text.length < 25 && commonSkills.includes(text);
            });
            if (skillElements.length > 0) {
              skillElements.forEach((el, index) => {
                if (index < newSkills.length && el.innerText !== newSkills[index]) {
                  el.innerText = newSkills[index];
                }
              });
            }
          }
        };

        const runAll = () => {
          processNode(document.body);
          injectSpecialDetails();
        };

        runAll();
        document.addEventListener('DOMContentLoaded', runAll);
        window.addEventListener('load', runAll);

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              processNode(node);
            });
            if (mutation.type === 'characterData') {
              const replaced = replaceTextContent(mutation.target.nodeValue);
              if (replaced !== mutation.target.nodeValue) {
                mutation.target.nodeValue = replaced;
              }
            }
          });
          injectSpecialDetails();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true
        });
      })();
</script>
  `;

  if (outputHtml.includes('</body>')) {
    outputHtml = outputHtml.replace('</body>', `${injectedScript}</body>`);
  } else {
    outputHtml = outputHtml + injectedScript;
  }

  return outputHtml;
};

async function execute() {
  try {
    const docRef = doc(db, 'portfolios', 'ovaise-shaikh');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const rawHtml = data.rawCustomHtml || data.customHtml;
      
      console.log("Compiling custom html using string concatenation...");
      const compiledHtml = compilePureString(rawHtml);
      
      console.log("Saving back to Firestore...");
      data.customHtml = compiledHtml;
      await setDoc(docRef, data);
      
      console.log("Successfully compiled and saved directly to Firestore!");
      console.log("Result contains MutationObserver?", compiledHtml.includes('MutationObserver'));
    } else {
      console.log("Document 'ovaise-shaikh' does not exist!");
    }
  } catch (e) {
    console.error("Execution error:", e);
  }
}

execute();
