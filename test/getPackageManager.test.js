const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const getPackageManager = require("../src/getPackageManager");
const { getLinkStrategy } = require("../src/commands/link");

function workspace(files) {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "coc-manager-"));
    for (const [name, content] of Object.entries(files)) {
        fs.writeFileSync(path.join(cwd, name), content);
    }
    return cwd;
}

test("detects physical node_modules package managers", (t) => {
    const cases = [
        [{ "package-lock.json": "{}" }, "npm", "npm"],
        [{ "pnpm-lock.yaml": "lockfileVersion: 9" }, "pnpm", "pnpm"],
        [{ "bun.lock": "" }, "bun", "bun"],
        [{ "yarn.lock": "# yarn lockfile v1" }, "yarn-classic", "yarn"]
    ];

    for (const [files, id, executable] of cases) {
        const cwd = workspace(files);
        t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
        const manager = getPackageManager({ cwd });
        assert.equal(manager.id, id);
        assert.equal(manager.executable, executable);
        assert.equal(manager.usesNodeModules, true);
        assert.equal(getLinkStrategy(manager), "direct");
    }
});

test("distinguishes Yarn Berry node_modules from PnP", (t) => {
    const lockfile = "__metadata:\n  version: 8\n";
    const nodeModulesCwd = workspace({
        "yarn.lock": lockfile,
        ".yarnrc.yml": "nodeLinker: node-modules\n"
    });
    const pnpCwd = workspace({ "yarn.lock": lockfile });
    t.after(() => fs.rmSync(nodeModulesCwd, { recursive: true, force: true }));
    t.after(() => fs.rmSync(pnpCwd, { recursive: true, force: true }));

    const nodeModules = getPackageManager({ cwd: nodeModulesCwd });
    const pnp = getPackageManager({ cwd: pnpCwd });
    assert.equal(nodeModules.linker, "node-modules");
    assert.equal(getLinkStrategy(nodeModules), "direct");
    assert.equal(pnp.linker, "pnp");
    assert.equal(pnp.usesNodeModules, false);
    assert.equal(getLinkStrategy(pnp), "package-manager");
    assert.throws(() => getLinkStrategy(pnp, ["--symlink"]), /not supported/);
});

test("defaults to normalized npm capabilities without a lockfile", (t) => {
    const cwd = workspace({});
    t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
    assert.deepEqual(getPackageManager({ cwd }), {
        id: "npm",
        name: "npm",
        executable: "npm",
        variant: null,
        linker: "node-modules",
        usesNodeModules: true,
        cwd
    });
});
