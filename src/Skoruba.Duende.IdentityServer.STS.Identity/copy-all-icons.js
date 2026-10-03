const fs = require("fs");
const path = require("path");

// Copies every lucide icon into wwwroot for development. `copy-used-icons.js`
// reduces the folder to the icons the views use before they are committed.
const sourceIconsPath = path.join(
  __dirname,
  "node_modules/lucide-static/icons"
);
const destIconsPath = path.join(__dirname, "wwwroot/icons/lucide");

fs.rmSync(destIconsPath, { recursive: true, force: true });
fs.mkdirSync(destIconsPath, { recursive: true });

const icons = fs
  .readdirSync(sourceIconsPath)
  .filter((file) => file.endsWith(".svg"));

icons.forEach((file) => {
  fs.copyFileSync(
    path.join(sourceIconsPath, file),
    path.join(destIconsPath, file)
  );
});

console.log(`✅ Copied ${icons.length} icons to ${destIconsPath}`);
