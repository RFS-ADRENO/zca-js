import fs from "fs";
import path from "path";

const apisDir = path.join(process.cwd(), "src", "apis");
const outputFile = path.join(process.cwd(), "src", "apis.ts");

function getAllApiFiles(dir) {
    const ignoreFiles = ["listen.ts", "login.ts", "loginQR.ts", "custom.ts"];
    return fs
        .readdirSync(dir)
        .filter((file) => file.endsWith(".ts") && !ignoreFiles.includes(file))
        .map((file) => {
            const nonExtension = file.slice(0, -3); // Remove .ts extension

            return {
                name: nonExtension,
                factoryName: `${nonExtension}Factory`,
            };
        });
}

function generateAPIsFile() {
    const allApiFiles = getAllApiFiles(apisDir);

    const importLines = allApiFiles.map((file) => {
        return `import { ${file.factoryName} } from "./apis/${file.name}.js";`;
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
        'import { Listener } from "./apis/listen.js";\n' +
        emptyNewLine +
        importLines.join("\n") +
        emptyNewLine +
        'import { customFactory } from "./apis/custom.js";\n' +
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
