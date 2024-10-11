// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default {
    input: "src/index.ts",
    output: {
        dir: "dist",
        format: "esm",
        preserveModules: true,
    },
    plugins: [typescript()],
    external: [
        "events",
        "ws",
        "form-data",
        "node:fs",
        "crypto-js",
        "crypto",
        "sharp",
        "pako",
        "spark-md5",
        "node:path",
        "semver",
        "fs",
    ],
};
