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
