const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const test = require("node:test");

const exec = promisify(execFile);
const cli = path.resolve(__dirname, "../src/coc.js");

function workspace(t, template) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "coc-cli-template-"));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    fs.writeFileSync(
        path.join(directory, "CoCreate.config.js"),
        `module.exports = ${JSON.stringify({ template })};`
    );
    return directory;
}

function writeFile(root, relativePath, value = relativePath) {
    const filename = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, value);
}

test("coc template applies include and exclude rules relative to its config", async (t) => {
    const cwd = workspace(t, [
        {
            entry: "./source",
            output: "./output",
            exclude: ["./admin/", "./config/"]
        },
        {
            entry: "./source",
            output: "./output",
            include: ["./admin/"],
            exclude: ["./admin/private/"]
        }
    ]);
    writeFile(cwd, "source/index.html");
    writeFile(cwd, "source/admin/index.html");
    writeFile(cwd, "source/admin/private/secret.html");
    writeFile(cwd, "source/config/private.js");

    const result = await exec(process.execPath, [cli, "template"], {
        cwd,
        timeout: 3000
    });

    assert.equal(fs.readFileSync(path.join(cwd, "output/index.html"), "utf8"), "source/index.html");
    assert.equal(fs.readFileSync(path.join(cwd, "output/admin/index.html"), "utf8"), "source/admin/index.html");
    assert.equal(fs.existsSync(path.join(cwd, "output/admin/private/secret.html")), false);
    assert.equal(fs.existsSync(path.join(cwd, "output/config/private.js")), false);
    assert.match(result.stdout, /Template complete: 2 file\(s\) copied/);
});

test("coc template dry run selects files without writing output", async (t) => {
    const cwd = workspace(t, [{ entry: "./source", output: "./output" }]);
    writeFile(cwd, "source/index.html");

    const result = await exec(process.execPath, [cli, "template", "--dry-run"], {
        cwd,
        timeout: 3000
    });

    assert.equal(fs.existsSync(path.join(cwd, "output")), false);
    assert.match(result.stdout, /Would copy: index.html/);
    assert.match(result.stdout, /Template complete: 1 file\(s\) selected/);
});

test("coc template preserves absolute path semantics", async (t) => {
    const cwd = workspace(t, []);
    const absoluteExclude = path.join(cwd, "source/private");
    fs.writeFileSync(
        path.join(cwd, "CoCreate.config.js"),
        `module.exports = ${JSON.stringify({
            template: [{
                entry: "./source",
                output: "./output",
                exclude: [absoluteExclude]
            }]
        })};`
    );
    writeFile(cwd, "source/index.html");
    writeFile(cwd, "source/private/secret.html");

    await exec(process.execPath, [cli, "template"], {
        cwd,
        timeout: 3000
    });

    assert.equal(fs.existsSync(path.join(cwd, "output/index.html")), true);
    assert.equal(fs.existsSync(path.join(cwd, "output/private/secret.html")), false);
});

test("coc template stays quiet when template is not configured", async (t) => {
    const cwd = workspace(t, undefined);
    const result = await exec(process.execPath, [cli, "template"], {
        cwd,
        timeout: 3000
    });
    assert.equal(result.stdout, "");
});
