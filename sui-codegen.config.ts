import path from "node:path";

/**
 * Generated bindings are committed so SDK consumers do not need Move sources.
 * Maintainers can point JITTER_CONTRACT_ROOT at a jitter-contract checkout.
 */
const contractRoot = process.env.JITTER_CONTRACT_ROOT
  ? path.resolve(process.env.JITTER_CONTRACT_ROOT)
  : path.resolve("../jitter-contract");

const contractPath = (...parts: string[]) => path.join(contractRoot, ...parts);

export default {
  output: "src/generated",
  generateSummaries: true,
  prune: true,

  packages: [
    {
      package: "jitter/jitter-config",
      packageName: "jitter_config",
      path: contractPath("jitter_config"),
    },
    {
      package: "jitter/jitter-framework",
      packageName: "jitter_framework",
      path: contractPath("jitter_framework"),
    },
    {
      package: "jitter/jitter",
      packageName: "jitter",
      path: contractPath("jitter"),
    },
    {
      package: "jitter/jitter-view",
      packageName: "jitter_view",
      path: contractPath("jitter_view"),
    },
    {
      package: "jitter/jitter-registry",
      packageName: "jitter_registry",
      path: contractPath("jitter_registry"),
    },
    {
      package: "jitter/jitter-extensions",
      packageName: "jitter_extensions",
      path: contractPath("jitter_extensions"),
    },
    {
      package: "jitter/demo-adapter",
      packageName: "demo_adapter",
      path: contractPath("jitter_adapter", "demo_adapter"),
    },
    {
      package: "jitter/scallop-adapter",
      packageName: "scallop_adapter",
      path: contractPath("jitter_adapter", "scallop_adapter"),
    },
    {
      package: "jitter/ember-adapter",
      packageName: "ember_adapter",
      path: contractPath("jitter_adapter", "ember_adapter"),
    },
    {
      package: "jitter/suilend-adapter",
      packageName: "suilend_adapter",
      path: contractPath("jitter_adapter", "suilend_adapter"),
    },
    {
      package: "jitter/navi-adapter",
      packageName: "navi_adapter",
      path: contractPath("jitter_adapter", "navi_adapter"),
    },
    {
      package: "jitter/jitter-oracle",
      packageName: "jitter_oracle",
      path: contractPath("jitter_oracle"),
    },
    {
      package: "jitter/jitter-admin",
      packageName: "jitter_admin",
      path: contractPath("jitter_admin"),
    },
  ],
};
