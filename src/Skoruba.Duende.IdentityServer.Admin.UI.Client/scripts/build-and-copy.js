import { rm, cp, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { exec } from "child_process";
import path from "path";

const spaPath = "../Skoruba.Duende.IdentityServer.Admin.UI.Spa/wwwroot";
const distPath = "./dist";
const indexPath = path.join(distPath, "index.html");
const customTitle = "<!--TITLE-->";

async function run() {
  if (existsSync(spaPath)) {
    console.log(`🧹 Clean up folder: ${spaPath}`);
    await rm(spaPath, { recursive: true, force: true });
  }

  console.log("⚙️ Executing vite build...");
  await new Promise((resolve, reject) => {
    exec("vite build", (err, stdout, stderr) => {
      if (err) return reject(err);
      console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });

  // 🔄 Replace <title> in index.html
  if (existsSync(indexPath)) {
    console.log(`✏️ Updating <title> in ${indexPath}`);
    let html = await readFile(indexPath, "utf8");
    html = html.replace(/<title>.*?<\/title>/i, customTitle);
    await writeFile(indexPath, html, "utf8");
  }

  console.log(`📂 Copy dist → ${spaPath}`);
  await cp(distPath, spaPath, { recursive: true });

  console.log("✅ Done!");
}

run().catch((err) => {
  console.error("❌ Build error:", err);
  process.exit(1);
});
