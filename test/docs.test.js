const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const test = require("node:test");

const exec = promisify(execFile);
const cli = path.resolve(__dirname, "../src/coc.js");

function writePackage(root, name) {
    fs.mkdirSync(root, { recursive: true });
    fs.writeFileSync(
        path.join(root, "package.json"),
        JSON.stringify({ name, version: "1.0.0" })
    );
    fs.mkdirSync(path.join(root, "src"), { recursive: true });
    fs.writeFileSync(
        path.join(root, "src", "index.js"),
        [
            "/**",
            " * Describes one sample API.",
            " * Keep replacement tokens $&, $`, $', and $$ literal.",
            " * @param {string} name - The sample name.",
            " * @returns {string} The sample name.",
            " */",
            "function sample(name) { return name; }",
            ""
        ].join("\n")
    );
}

function createWorkspace(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "coc-cli-docs-"));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    return root;
}

function writeTemplates(root) {
    const templates = path.join(root, "templates");
    fs.mkdirSync(templates, { recursive: true });
    fs.writeFileSync(path.join(templates, "index.html"),
        '<div render-data="__COCREATE_RENDER_DATA__"><template render="modules" render-as="module"><a>{{module.name}}</a></template></div>');
    fs.writeFileSync(path.join(templates, "page.html"),
        '<div render-data="__COCREATE_RENDER_DATA__"><h1>{{module.name}}</h1><template render="module.doclets" render-as="doclet"><article id="{{doclet.anchor}}">{{doclet.name}}</article></template></div>');
    return templates;
}

function readRenderData(filePath) {
    const html = fs.readFileSync(filePath, "utf8");
    const match = html.match(/render-data="([^"]*)"/);
    assert.ok(match, `Expected render-data in ${filePath}`);
    const json = match[1]
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
    return { html, data: JSON.parse(json) };
}

test("coc docs parses configured modules and honors the docs exclusion", async (t) => {
    const root = createWorkspace(t);
    const modulePath = path.join(root, "modules", "CoCreate-sample");
    const speechPath = path.join(root, "modules", "CoCreate-speech-synthesis");
    const excludedPath = path.join(root, "modules", "CoCreate-excluded");
    const pluginPath = path.join(root, "plugins", "CoCreate-sample-plugin");
    const projectPath = path.join(root, "projects", "site");
    writePackage(modulePath, "@cocreate/unrelated-package-name");
    writePackage(speechPath, "@cocreate/speech-synthesis");
    writePackage(excludedPath, "@cocreate/excluded");
    writePackage(pluginPath, "@cocreate/sample-plugin");
    writePackage(projectPath, "@cocreate/site");
    const templates = writeTemplates(root);

    const config = {
        modules: {
            sample: { path: "./modules/CoCreate-sample" },
            speechSynthesis: { path: "./modules/CoCreate-speech-synthesis" },
            excluded: { path: "./modules/CoCreate-excluded", exclude: ["docs"] }
        },
        plugins: {
            "sample-plugin": { path: "./plugins/CoCreate-sample-plugin" }
        },
        projects: {
            site: { path: "./projects/site" }
        },
        documentation: {
            output: "./generated/docs",
            template: "./templates"
        }
    };
    fs.writeFileSync(
        path.join(root, "CoCreate.config.js"),
        `module.exports = ${JSON.stringify(config)};`
    );
    const stalePage = path.join(root, "generated/docs", "old-module", "index.html");
    fs.mkdirSync(path.dirname(stalePage), { recursive: true });
    fs.writeFileSync(stalePage, "<h1>Old module</h1>");

    const result = await exec(process.execPath, [cli, "docs", "--json"], {
        cwd: root,
        timeout: 15000
    });
    const output = JSON.parse(result.stdout);

    assert.match(result.stderr, /\[docs\] Parsing JSDoc for 3 module page\(s\) from src\//);
    assert.match(result.stderr, /\[docs\] Parsing 2\/3: speechSynthesis/);
    assert.match(result.stderr, /\[docs\] Rendering index and 3 module page\(s\)/);
    assert.deepEqual(Object.keys(output).sort(), ["errors", "modules", "schemaVersion", "type"]);
    assert.equal(output.type, "modules");
    assert.equal(output.schemaVersion, 1);
    assert.deepEqual(output.modules.map((module) => module.name), ["sample", "speechSynthesis", "sample-plugin"]);
    assert.deepEqual(output.modules.map((module) => module.slug), ["sample", "speech-synthesis", "sample-plugin"]);
    assert.equal(output.modules[0].title, "Sample");
    assert.equal(output.modules[1].title, "Speech Synthesis");
    assert.doesNotMatch(output.modules[0].name, /^CoCreate-/);
    assert.equal(output.modules[0].module, undefined);
    assert.equal(output.modules[0].doclets[0].name, "sample");
    assert.match(output.modules[0].doclets[0].description, /\$&.*\$`.*\$'.*\$\$/);
    assert.equal(output.modules[0].doclets[0].params[0].name, "name");
    assert.deepEqual(output.errors, []);
    assert.equal(fs.existsSync(path.join(root, "generated/docs/index.html")), true);
    assert.equal(fs.existsSync(path.join(root, "generated/docs/sample/index.html")), true);
    assert.equal(fs.existsSync(path.join(root, "generated/docs/speech-synthesis/index.html")), true);
    assert.equal(fs.existsSync(stalePage), false);
    const index = readRenderData(path.join(root, "generated/docs/index.html"));
    const page = readRenderData(path.join(root, "generated/docs/sample/index.html"));
    assert.equal(index.data.type, "modules");
    assert.equal(index.data.modules.length, 3);
    assert.equal(index.data.project, undefined);
    assert.match(index.html, /render="modules" render-as="module"/);
    assert.equal(page.data.type, "modules");
    assert.equal(page.data.modules.length, 3);
    assert.equal(page.data.module.name, "sample");
    assert.equal(page.data.project, undefined);
    assert.match(page.html, /render="module\.doclets" render-as="doclet"/);
    assert.equal(fs.existsSync(templates), true);
});

test("coc docs parses the current workspace when no repository groups are configured", async (t) => {
    const root = createWorkspace(t);
    writePackage(root, "@cocreate/current-project");
    fs.writeFileSync(
        path.join(root, "CoCreate.config.js"),
        "module.exports = { documentation: { output: './src/docs' } };"
    );

    const result = await exec(process.execPath, [cli, "docs", "--json"], {
        cwd: root,
        timeout: 15000
    });
    const output = JSON.parse(result.stdout);

    assert.equal(output.type, "modules");
    assert.equal(output.project, undefined);
    assert.equal(output.modules.length, 1);
    assert.equal(output.modules[0].name, "@cocreate/current-project");
    assert.equal(output.modules[0].doclets[0].name, "sample");
});
