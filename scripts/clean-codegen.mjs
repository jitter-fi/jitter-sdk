import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sdkRoot = path.resolve(scriptDir, "..");
const contractRoot = process.env.JITTER_CONTRACT_ROOT
  ? path.resolve(process.env.JITTER_CONTRACT_ROOT)
  : path.resolve(sdkRoot, "../jitter-contract");

const packageDirectories = [
  "jitter_framework",
  "jitter",
  "jitter_view",
  "jitter_registry",
  "jitter_extensions",
  path.join("jitter_adapter", "demo_adapter"),
  path.join("jitter_adapter", "scallop_adapter"),
  path.join("jitter_adapter", "ember_adapter"),
  path.join("jitter_adapter", "suilend_adapter"),
  path.join("jitter_adapter", "navi_adapter"),
  "jitter_oracle",
  "jitter_admin",
];

await Promise.all([
  rm(path.join(sdkRoot, "src", "generated"), { recursive: true, force: true }),
  ...packageDirectories.map((directory) =>
    rm(path.join(contractRoot, directory, "package_summaries"), {
      recursive: true,
      force: true,
    }),
  ),
]);
