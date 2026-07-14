import * as fs from 'fs';

const html = fs.readFileSync('fetched_ovaise_shaikh.html', 'utf8');

const originalWords = ["Gufran", "Muhammad"];
const userData = {
  name: "Ovaise Shaikh",
  title: "DevOps Engineer",
  bio: "Test Bio",
  skills: ["docker", "kubernetes"],
  projects: [],
  experience: []
};
const originalTitleText = "Backend Developer & GenAI Specialist";

const testStringReplace = (html) => {
  let outputHtml = html;
  const injectedScript = `
<script>
    (function() {
      console.log("[MUTATION-OBSERVER] Initializing DOM hijacking script...");
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

const result = testStringReplace(html);
console.log("Result length:", result.length);
console.log("Contains [MUTATION-OBSERVER]?", result.includes('[MUTATION-OBSERVER]'));
console.log("Difference in length:", result.length - html.length);
