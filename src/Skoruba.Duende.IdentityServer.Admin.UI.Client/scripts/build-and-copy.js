import { rm, cp } from "fs/promises";
import { existsSync } from "fs";
import { exec } from "child_process";

const spaPath = "../Skoruba.Duende.IdentityServer.Admin.UI.Spa/wwwroot";
const distPath = "./dist";

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

  console.log(`📂 Copy dist → ${spaPath}`);
  await cp(distPath, spaPath, { recursive: true });

  console.log("✅ Done!");
}

run().catch((err) => {
  console.error("❌ Build error:", err);
  process.exit(1);
});
