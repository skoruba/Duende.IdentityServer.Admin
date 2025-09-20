const fs = require("fs");
const path = require("path");
const glob = require("glob");

function extractKeys(obj, prefix = "") {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object") {
      keys = keys.concat(extractKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const translationPath = path.resolve(
  __dirname,
  "src/i18n/translations.en.json"
);
const translationJson = JSON.parse(fs.readFileSync(translationPath, "utf-8"));
const translationKeys = extractKeys(translationJson);

const files = glob.sync("./src/**/*.{ts,tsx}", { absolute: true });

const usedKeys = new Set();

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");

  const regexT = /t\(['"`]([\w\d.-]+)['"`]\)/g;
  let match;
  while ((match = regexT.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }

  translationKeys.forEach((key) => {
    if (content.includes(`"${key}"`) || content.includes(`'${key}'`)) {
      usedKeys.add(key);
    }
  });
});

const unusedKeys = translationKeys.filter((key) => !usedKeys.has(key));

console.log("Unused keys: (" + unusedKeys.length + ")");
console.log("--------------------------------------------------");
unusedKeys.forEach((key) => console.log(`- ${key}`));
