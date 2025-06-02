// rollup.config.js

export default {
    input: "dist/index.js",
    output: {
        dir: "dist/cjs",
        entryFileNames: "[name].cjs",
        format: "cjs",
        preserveModules: true,
    },
    external: [
        "crypto-js",
        "events",
        "form-data",
        "fs",
        "node:crypto",
        "node:fs",
        "node:fs/promises",
        "node:path",
        "pako",
        "semver",
        "sharp",
        "spark-md5",
        "tough-cookie",
        "ws",
    ],
};
