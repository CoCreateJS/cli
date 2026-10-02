const fs = require("fs");
const path = require("path");
const { getConfig } = require("../getConfig");

function readStdin() {
    return new Promise((resolve, reject) => {
        let value = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => value += chunk);
        process.stdin.on("end", () => resolve(value));
        process.stdin.on("error", reject);
    });
}

function parseInput(value) {
    const input = value.trim().replace(/^(['"])([\s\S]*)\1$/, "$2");
    const filePath = path.resolve(process.cwd(), input);
    const source = fs.existsSync(filePath)
        ? fs.readFileSync(filePath, "utf8")
        : input;
    return JSON.parse(source);
}

function stringifyResponse(response) {
    const sensitiveKeys = new Set([
        "apikey",
        "api_key",
        "password",
        "token",
        "authorization"
    ]);
    return JSON.stringify(response, (key, value) =>
        sensitiveKeys.has(key.toLowerCase()) ? undefined : value, 2);
}

module.exports = async function send(directory, args = []) {
    try {
        const projectConfig = await getConfig(process.cwd());
        if (!projectConfig?.configPath) {
            throw new Error("CoCreate.config.js could not be found.");
        }

        const input = args.length ? args.join(" ") : await readStdin();
        if (!input.trim()) {
            throw new Error("Provide an envelope as JSON, a JSON file, or stdin.");
        }

        const payload = parseInput(input);
        if (!payload || Array.isArray(payload) || typeof payload !== "object") {
            throw new Error("The envelope must be a JSON object.");
        }
        if (!payload.method) throw new Error("The envelope requires a method.");

        const [{ default: Config }, { default: socket }] = await Promise.all([
            import("@cocreate/config"),
            import("@cocreate/socket-client")
        ]);
        await socket.init();
        const connection = await Config.prompt(
            {
                organization_id: { prompt: "Enter your organization_id: " },
                host: { prompt: "Enter the host: " },
                prompt: {
                    prompt: "Choose an authentication option: \n1.apikey\n2.Sign In\n",
                    choices: {
                        1: { apikey: { prompt: "Enter your apikey: " } },
                        2: {
                            email: { prompt: "Enter your email: " },
                            password: { prompt: "Enter your password: " }
                        }
                    }
                }
            },
            null,
            null,
            projectConfig.configPath
        );

        const response = await socket.send({ ...connection, ...payload });
        process.stdout.write(`${stringifyResponse(response)}\n`);
        process.exit(0);
    } catch (error) {
        console.error(`Send failed: ${error.message}`);
        process.exit(1);
    }
};
