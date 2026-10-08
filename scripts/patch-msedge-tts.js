const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "node_modules", "msedge-tts", "dist", "MsEdgeTTS.js");

if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, "utf8");
  const badPattern = `else if (message.includes(\`Path:\${messageTypes.AUDIO}\`) && m.data instanceof ArrayBuffer)`;
  const fixedPattern = `else if (message.includes(\`Path:\${messageTypes.AUDIO}\`) && (m.data instanceof ArrayBuffer || m.data instanceof Uint8Array || index_1.Buffer.isBuffer(m.data)))`;

  if (content.includes(badPattern)) {
    content = content.replace(badPattern, fixedPattern);
    fs.writeFileSync(target, content, "utf8");
    console.log("Successfully patched msedge-tts for Node buffer support.");
  }
}
