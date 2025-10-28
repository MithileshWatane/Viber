import { saveTemplateStructureToJson } from "./modules/playground/lib/path-to-json.js";
import path from "path";

(async () => {
  const templateName = "react";
  const templatePath = path.join(process.cwd(), "/vibecode-starters/react"); // Your local folder
  const outputPath = path.join(process.cwd(), "public", "templates", templateName, "template.json");

  await saveTemplateStructureToJson(templatePath, outputPath);

  console.log(`✅ Template JSON generated at ${outputPath}`);
})();
