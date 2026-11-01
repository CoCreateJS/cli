const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const addMeta = require("../src/addMeta");
const cloneConfig = require("../src/cloneConfig");

test("cloneConfig isolates nested config data from runtime mutations", () => {
    const source = {
        modules: {
            editor: {
                path: "../CoCreate-editor",
                exclude: ["git"]
            }
        },
        directories: [
            {
                entry: "./src",
                object: { pathname: "{{pathname}}" }
            }
        ]
    };
    const runtime = cloneConfig(source);

    runtime.modules.editor.absolutePath = "/workspace/CoCreate-editor";
    runtime.modules.editor.exclude.push("docs");
    runtime.directories[0].object.pathname = "/runtime/path";

    assert.deepEqual(source, {
        modules: {
            editor: {
                path: "../CoCreate-editor",
                exclude: ["git"]
            }
        },
        directories: [
            {
                entry: "./src",
                object: { pathname: "{{pathname}}" }
            }
        ]
    });
    assert.notEqual(runtime.modules.editor, source.modules.editor);
    assert.notEqual(runtime.directories[0].object, source.directories[0].object);
});

test("addMeta enriches a working config without changing the source snapshot", async (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "coc-config-snapshot-"));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const moduleRoot = path.join(root, "modules", "editor");
    fs.mkdirSync(moduleRoot, { recursive: true });
    fs.writeFileSync(
        path.join(moduleRoot, "package.json"),
        JSON.stringify({ name: "@cocreate/editor", dependencies: { "@cocreate/docs": "^1.24.0" } })
    );

    const source = {
        modules: {
            editor: { path: "./modules/editor", exclude: ["git"] }
        }
    };
    const runtime = cloneConfig(source);
    await addMeta(Object.values(runtime.modules), [], root);

    assert.deepEqual(source, {
        modules: {
            editor: { path: "./modules/editor", exclude: ["git"] }
        }
    });
    assert.equal(runtime.modules.editor.absolutePath, moduleRoot);
    assert.equal(runtime.modules.editor.packageName, "@cocreate/editor");
    assert.deepEqual(runtime.modules.editor.deps, ["@cocreate/docs"]);
});
