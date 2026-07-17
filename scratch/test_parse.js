const combinedText = "i have worked in syscom for three year and i made multiple api es and and solve bugs";

const projects = [];

// Match action phrases
const actionRegex = /(?:built|made|developed|created|designed|solved|solve|resolved|implement|implemented|integrated|integrating)\s+([a-zA-Z0-9\s\-]+?)(?=\s+(?:using|with|at|for|in|on|and|but|from|to|during|pvt|ltd|inc|corp|company)\b|\.|\,|$)/gi;
let match;
while ((match = actionRegex.exec(combinedText)) !== null) {
  let target = match[1].trim();
  if (target.length > 2 && target.length < 50) {
    let title = target.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    // Enhance specific titles
    if (title.toLowerCase().includes("api")) {
      title = "API Development & Integration";
    } else if (title.toLowerCase().includes("bug")) {
      title = "Bug Resolution & System Optimization";
    }
    
    const desc = `Successfully designed, implemented, and optimized ${target} in production environments.`;
    projects.push({
      title: title,
      desc: desc,
      tech: []
    });
  }
}

console.log("Extracted Projects:", JSON.stringify(projects, null, 2));
