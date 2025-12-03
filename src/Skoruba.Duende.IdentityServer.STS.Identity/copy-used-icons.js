const fs = require("fs");
const path = require("path");

// Paths
const viewsPath = path.join(__dirname, "Views");
const sourceIconsPath = path.join(
  __dirname,
  "node_modules/lucide-static/icons"
);
const destIconsPath = path.join(__dirname, "wwwroot/icons/lucide");

// Recursive function to find all .cshtml files
function findCshtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findCshtmlFiles(filePath, fileList);
    } else if (file.endsWith(".cshtml")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Find all .cshtml files
const cshtmlFiles = findCshtmlFiles(viewsPath);

// Set to store used icons
const usedIcons = new Set();

console.log(`🔍 Scanning ${cshtmlFiles.length} .cshtml files...\n`);

// Process all .cshtml files
cshtmlFiles.forEach((filePath) => {
  const relativePath = path.relative(viewsPath, filePath);
  const content = fs.readFileSync(filePath, "utf8");

  // Find all instances of <lucideicon name="..." />
  const iconRegex = /<lucideicon\s+name="([^"]+)"/gi;
  let match;

  while ((match = iconRegex.exec(content)) !== null) {
    const iconName = match[1];

    // If it's a dynamic value (e.g. @item.Icon), search for definition
    if (iconName.startsWith("@")) {
      console.log(`⚠️  Dynamic icon found in ${relativePath}: ${iconName}`);

      // Search for icon definitions in arrays (e.g. new { Icon = "badge-check" })
      const arrayIconRegex = /Icon\s*=\s*"([^"]+)"/gi;
      let arrayMatch;
      while ((arrayMatch = arrayIconRegex.exec(content)) !== null) {
        usedIcons.add(arrayMatch[1]);
        console.log(`   ✓ Added icon from array: ${arrayMatch[1]}`);
      }
      continue;
    }

    usedIcons.add(iconName);
  }
});

console.log(`\n✅ Found ${usedIcons.size} unique icons in use:\n`);
const sortedIcons = Array.from(usedIcons).sort();
sortedIcons.forEach((icon) => console.log(`   - ${icon}`));

// Create destination folder if it doesn't exist
if (!fs.existsSync(destIconsPath)) {
  fs.mkdirSync(destIconsPath, { recursive: true });
  console.log(`\n📁 Created folder: ${destIconsPath}`);
}

// Delete all existing icons in destination folder
const existingIcons = fs.existsSync(destIconsPath)
  ? fs.readdirSync(destIconsPath)
  : [];
existingIcons.forEach((file) => {
  fs.unlinkSync(path.join(destIconsPath, file));
});

console.log(`\n📋 Copying ${usedIcons.size} icons...\n`);

let copiedCount = 0;
let missingIcons = [];

sortedIcons.forEach((icon) => {
  const sourceFile = path.join(sourceIconsPath, `${icon}.svg`);
  const destFile = path.join(destIconsPath, `${icon}.svg`);

  try {
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, destFile);
      copiedCount++;
      console.log(`✓ ${icon}.svg`);
    } else {
      missingIcons.push(icon);
      console.log(`⚠️  ${icon}.svg - NOT FOUND in lucide-static!`);
    }
  } catch (err) {
    console.error(`❌ Error copying ${icon}.svg:`, err.message);
  }
});

console.log(`\n✅ Copied ${copiedCount} icons`);
if (missingIcons.length > 0) {
  console.log(
    `⚠️  ${missingIcons.length} icons not found: ${missingIcons.join(", ")}`
  );
}

// Calculate directory size
const getDirectorySize = (dir) => {
  let size = 0;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    size += stats.size;
  });
  return size;
};

const finalSize = getDirectorySize(destIconsPath);
const finalSizeKB = (finalSize / 1024).toFixed(2);
console.log(`📦 Icon folder size: ${finalSizeKB} KB\n`);
console.log(`💡 You can now commit the icons to git.`);
