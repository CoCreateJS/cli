const fs = require("node:fs");
const path = require("node:path");
const CoCreateDocs = require("@cocreate/docs");

function getEntries(config = {}) {
    const entries = [];
    const addGroup = (group, type) => {
        if (!group || typeof group !== "object") return;

        for (const [name, repo] of Object.entries(group)) {
            if (!repo || typeof repo !== "object" || !repo.path) continue;
            // The config key is the public module name; repo.path is only a
            // checkout location and may contain an organization prefix.
            entries.push({ ...repo, name, type });
        }
    };

    addGroup(config.modules, "module");
    addGroup(config.plugins, "plugin");

    if (Array.isArray(config.repositories)) {
        config.repositories.forEach((repo) => {
            if (!repo || typeof repo !== "object" || !repo.path) return;
            entries.push({
                ...repo,
                name: repo.name || path.basename(repo.path),
                type: "repository"
            });
        });
    }

    // Projects are useful as the source when a config has no module/plugin
    // collection, while a workspace with modules documents those by default.
    if (!entries.length) addGroup(config.projects, "project");

    return entries;
}

function resolveTargets(repositories, config = {}) {
    const configRoot = path.dirname(
        config.configPath || path.join(process.cwd(), "CoCreate.config.js")
    );
    const entries = getEntries(config);

    if (!entries.length) {
        const packagePath = path.join(configRoot, "package.json");
        let packageJson = {};
        try {
            packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
        } catch {}

        return [{
            name: packageJson.name || path.basename(configRoot),
            packageName: packageJson.name,
            path: ".",
            absolutePath: configRoot,
            type: "workspace"
        }];
    }

    const cliRepositories = Array.isArray(repositories) ? repositories : [];
    const seenPaths = new Set();

    return entries
        .filter((repo) => !Array.isArray(repo.exclude) || !repo.exclude.includes("docs"))
        .map((repo) => {
            const cliRepo = cliRepositories.find((candidate) =>
                candidate.name === repo.name || candidate.path === repo.path
            );
            const absolutePath = cliRepo?.absolutePath || path.resolve(configRoot, repo.path);
            return {
                ...cliRepo,
                ...repo,
                absolutePath,
                packageName: cliRepo?.packageName || repo.packageName
            };
        })
        .filter((repo) => {
            if (seenPaths.has(repo.absolutePath)) return false;
            seenPaths.add(repo.absolutePath);
            return true;
        });
}

async function collectDocumentation(
    repositories,
    config = {},
    docsApi = CoCreateDocs,
    onProgress = () => {}
) {
    const documentationConfig = config.documentation || {};
    const sourceDirectory = documentationConfig.sourceDirectory || "src";
    const parseJSDoc = docsApi.parseJSDoc;
    if (typeof parseJSDoc !== "function") {
        throw new Error(
            "@cocreate/docs does not expose parseJSDoc. Install a version with JSDoc parsing support."
        );
    }

    const targets = resolveTargets(repositories, config);
    onProgress({
        phase: "parse-start",
        total: targets.length,
        sourceDirectory
    });

    const modules = [];
    const errors = [];
    for (let index = 0; index < targets.length; index++) {
        const repo = targets[index];
        onProgress({
            phase: "parse-page",
            current: index + 1,
            total: targets.length,
            name: repo.name,
            sourceDirectory
        });
        const sourcePath = path.resolve(repo.absolutePath, sourceDirectory);
        if (!fs.existsSync(sourcePath)) {
            errors.push({
                name: repo.name,
                path: repo.path,
                error: `JSDoc source directory does not exist: ${sourcePath}`
            });
            continue;
        }

        try {
            const diagnostics = [];
            const doclets = parseJSDoc(sourcePath, {
                cwd: repo.absolutePath,
                recurse: true,
                private: documentationConfig.private === true,
                onDiagnostic: (diagnostic) => diagnostics.push(diagnostic)
            });
            modules.push({
                name: repo.name,
                packageName: repo.packageName || null,
                type: repo.type,
                sourceDirectory,
                doclets,
                diagnostics
            });
        } catch (error) {
            errors.push({
                name: repo.name,
                path: repo.path,
                error: error.message
            });
        }
    }

    const dataset = {
        type: "modules",
        schemaVersion: 1,
        errors,
        modules
    };

    return typeof docsApi.prepareDataset === "function"
        ? docsApi.prepareDataset(dataset)
        : dataset;
}

module.exports = async function docs(repositories = [], args = [], config = {}) {
    const jsonOutput = args.includes("--json");
    const logProgress = (message) => {
        const stream = jsonOutput ? process.stderr : process.stdout;
        stream.write(`${message}\n`);
    };
    const data = await collectDocumentation(repositories, config, CoCreateDocs, (event) => {
        if (event.phase === "parse-start") {
            logProgress(
                `[docs] Parsing JSDoc for ${event.total} module page(s) from ${event.sourceDirectory}/.`
            );
        } else if (event.phase === "parse-page") {
            logProgress(`[docs] Parsing ${event.current}/${event.total}: ${event.name}`);
        }
    });
    const documentationConfig = config.documentation || {};
    const configRoot = path.dirname(
        config.configPath || path.join(process.cwd(), "CoCreate.config.js")
    );

    let files;
    if (documentationConfig.template && documentationConfig.output && documentationConfig.targets) {
        if (typeof CoCreateDocs.renderDocumentation !== "function") {
            throw new Error(
                "@cocreate/docs does not expose renderDocumentation. Install a version with template rendering support."
            );
        }
        const templatePath = path.resolve(configRoot, documentationConfig.template);
        const outputPath = path.resolve(configRoot, documentationConfig.output);
        logProgress(
            `[docs] Rendering ${documentationConfig.targets.length} configured target(s) with ${documentationConfig.template}.`
        );
        const { renderValue } = await import("@cocreate/utils");
        files = await CoCreateDocs.renderDocumentation(data, {
            template: templatePath,
            output: outputPath,
            targets: documentationConfig.targets,
            renderValue
        });
    }

    if (jsonOutput) {
        process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
    } else {
        const count = data.modules.reduce((total, module) => total + module.doclets.length, 0);
        const diagnosticCount = data.modules.reduce(
            (total, module) => total + module.diagnostics.length,
            0
        );
        console.log(
            `[docs] Parsed ${count} documented symbols across ${data.modules.length} module(s).`
        );
        if (diagnosticCount) {
            console.warn(`[docs] JSDoc reported ${diagnosticCount} tag/parser diagnostic(s).`);
        }
        if (files) {
            console.log(`[docs] Wrote ${files.length} HTML file(s) to ${documentationConfig.output}.`);
        } else {
            console.log("[docs] Configure documentation.template, documentation.output, and documentation.targets to render HTML.");
        }
        for (const error of data.errors) {
            console.error(`[docs] ${error.name}: ${error.error}`);
        }
    }

    return data.errors;
};

module.exports.collectDocumentation = collectDocumentation;
module.exports.resolveTargets = resolveTargets;
