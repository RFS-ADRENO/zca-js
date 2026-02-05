import fs from "fs";
import path from "path";

const apisDir = path.join(process.cwd(), "src", "apis");
const outputFile = path.join(process.cwd(), "src", "apis.ts");

function getAllApiFiles(dir, relativePath = "") {
    const ignoreFiles = ["listen.ts", "login.ts", "loginQR.ts", "custom.ts", "index.ts"];
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllApiFiles(filePath, path.join(relativePath, file)));
        } else {
            if (file.endsWith(".ts") && !ignoreFiles.includes(file)) {
                const nonExtension = file.slice(0, -3);
                // Keep unique name if needed, or just use filename. Base code used filename as property name.
                // Risk of collision if same filename in different folders?
                // The original code used filename as property.
                // If we have group/abc.ts and user/abc.ts, we have collision.
                // Assuming unique filenames across project based on my moves.
                // Import path needs to be relative to src/apis/

                results.push({
                    name: nonExtension,
                    factoryName: `${nonExtension}Factory`,
                    importPath: relativePath ? `${relativePath}/${nonExtension}` : nonExtension
                });
            }
        }
    });
    return results;
}

function generateAPIsFile() {
    const allApiFiles = getAllApiFiles(apisDir);

    const importLines = allApiFiles.map((file) => {
        return `import { ${file.factoryName} } from "./apis/${file.importPath}.js";`;
    });

    const propertyLines = allApiFiles.map((file) => {
        return `    public ${file.name}: ReturnType<typeof ${file.factoryName}>;`;
    });

    const constructorLines = allApiFiles.map((file) => {
        return `        this.${file.name} = ${file.factoryName}(ctx, this);`;
    });

    const emptyNewLine = "\n";

    const content =
        "" +
        'import { Listener } from "./apis/message/listen.js";\n' +
        emptyNewLine +
        importLines.join("\n") +
        emptyNewLine +
        'import { customFactory } from "./apis/other/custom.js";\n' +
        'import type { ZPWServiceMap, ContextSession } from "./context.js";\n' +
        emptyNewLine +
        "export class API {\n" +
        "    public zpwServiceMap: ZPWServiceMap;\n" +
        "    public listener: Listener;\n" +
        emptyNewLine +
        propertyLines.join("\n") +
        emptyNewLine +
        emptyNewLine +
        "    public custom: ReturnType<typeof customFactory>;\n" +
        emptyNewLine +
        "    constructor(ctx: ContextSession, zpwServiceMap: ZPWServiceMap, wsUrls: string[]) {\n" +
        "        this.zpwServiceMap = zpwServiceMap;\n" +
        "        this.listener = new Listener(ctx, wsUrls);\n" +
        emptyNewLine +
        constructorLines.join("\n") +
        emptyNewLine +
        emptyNewLine +
        "        this.custom = customFactory(ctx, this);\n" +
        "    }\n" +
        "}\n";

    fs.writeFileSync(outputFile, content, "utf-8");
    console.log(`\nAPIs file generated at ${outputFile}\n`);
}

generateAPIsFile();
