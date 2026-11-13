const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const test = require('node:test');
const cli = path.resolve(__dirname, '../src/coc.js');
const organization_id = '5ff747727005da1c272740ab';

async function fixture(t) {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'coc-crud-'));
    t.after(() => fs.rm(root, { recursive: true, force: true }));
    const directory = path.join(root, 'CoCreateDB');
    await fs.mkdir(directory);
    await fs.writeFile(path.join(root, 'CoCreate.config.js'), `module.exports = ${JSON.stringify({ organization_id, repositories: [], db: { directory } })}`);
    return { root, directory };
}

async function invoke(root, args, input, extraEnv = {}) {
    const env = { ...process.env, ...extraEnv };
    // The command must use the explicit test storage, never a user's active data.
    if (!Object.hasOwn(extraEnv, 'COCREATE_DB_DIRECTORY')) delete env.COCREATE_DB_DIRECTORY;
    const child = spawn(process.execPath, [cli, 'crud', ...args], { cwd: root, env, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', data => stdout += data);
    child.stderr.on('data', data => stderr += data);
    child.stdin.end(input === undefined ? '' : typeof input === 'string' ? input : JSON.stringify(input));
    const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
    const clean = stdout.replace(/\x1b\[[0-9;]*m/g, '');
    const start = clean.indexOf('{');
    return { code, stdout, stderr, data: start === -1 ? undefined : JSON.parse(clean.slice(start)) };
}
const payload = (method, extra = {}) => ({ method, organization_id, database: 'dev', array: 'records', ...extra });

test('actual CLI uses CRUD server for create, indexed read, update, and delete with no API key', async t => {
    const { root, directory } = await fixture(t);
    const options = [];
    const id = '6c0000000000000000000002';
    const created = await invoke(root, options, payload('object.create', { object: { _id: id, score: 1, name: "User's record" } }));
    assert.equal(created.code, 0, created.stderr);
    assert.equal(created.data.success, true);
    assert.equal(created.data.storage, 'production', 'The result must pass through CRUD dispatch');
    const updated = await invoke(root, options, payload('object.update', { object: { _id: id, $inc: { score: 2 } } }));
    assert.equal(updated.code, 0, updated.stderr);
    const read = await invoke(root, options, payload('object.read', { apikey: 'deliberately-invalid-key', filter: { query: { score: 3 } } }));
    assert.equal(read.code, 0, read.stderr);
    assert.equal(read.data.object[0].score, 3);
    assert.equal(read.data.object[0].name, "User's record");
    assert.equal(read.data.apikey, '[redacted]');
    assert.equal(read.stdout.includes('deliberately-invalid-key'), false);
    const deleted = await invoke(root, options, payload('object.delete', { object: { _id: id } }));
    assert.equal(deleted.code, 0, deleted.stderr);
    const empty = await invoke(root, options, payload('object.read'));
    assert.equal(empty.data.object.length, 0);
});

test('file and inline JSON inputs preserve paths, apostrophes, and credential redaction', async t => {
    const { root, directory } = await fixture(t);
    const request = payload('object.create', { array: 'keys', object: { key: 'test-secret-value', admin: true, name: "Key's name" } });
    const file = path.join(root, 'request with spaces.json');
    await fs.writeFile(file, JSON.stringify(request));
    const created = await invoke(root, [file]);
    assert.equal(created.code, 0, created.stderr);
    assert.equal(created.stdout.includes('test-secret-value'), false);
    assert.equal(created.data.object[0].key, '[redacted]');
    const read = await invoke(root, [JSON.stringify(payload('object.read', { array: 'keys' }))]);
    assert.equal(read.code, 0, read.stderr);
    assert.equal(read.data.object[0].name, "Key's name");
});

for (const [name, input, args, expected] of [
    ['malformed JSON', '{"key":"secret-that-must-not-be-echoed",', [], /valid JSON/],
    ['non-object envelope', [], [], /JSON object/],
    ['non-CRUD method', { method: 'workflow.example' }, [], /supported CRUD method/],
    ['driver failure', payload('object.read', { database: ['dev', 'other'] }), [], undefined]
]) {
    test(`failure returns nonzero: ${name}`, async t => {
        const { root } = await fixture(t);
        const result = await invoke(root, args, input);
        assert.equal(result.code, 1);
        if (expected) assert.match(result.stderr, expected);
        else assert.equal(result.data.success, false);
        assert.equal(result.stdout.includes('secret-that-must-not-be-echoed'), false);
        assert.equal(result.stderr.includes('secret-that-must-not-be-echoed'), false);
    });
}

test('environment directory and help work without Socket credentials', async t => {
    const { root, directory } = await fixture(t);
    const read = await invoke(root, [], payload('object.read'), { COCREATE_DB_DIRECTORY: directory });
    assert.equal(read.code, 0, read.stderr);
    const help = await invoke(root, ['--help']);
    assert.equal(help.code, 0);
    assert.match(help.stdout, /Usage: coc crud/);
});


test('configured DB directory resolves relative to the process directory and config stays unchanged', async t => {
    const { root } = await fixture(t);
    const config = `module.exports = ${JSON.stringify({ organization_id, repositories: [], db: { directory: 'local-db' } })}`;
    await fs.writeFile(path.join(root, 'CoCreate.config.js'), config);
    const created = await invoke(root, [], payload('object.create', { object: { name: 'local' } }));
    assert.equal(created.code, 0, created.stderr);
    const read = await invoke(root, [], payload('object.read'));
    await fs.access(path.join(root, 'local-db'));
    assert.equal(read.data.object[0].name, 'local');
    assert.equal(await fs.readFile(path.join(root, 'CoCreate.config.js'), 'utf8'), config);
});


test('an inline envelope defaults to the nested process working directory', async t => {
    const { root } = await fixture(t);
    const nested = path.join(root, 'project', 'src');
    await fs.writeFile(path.join(root, 'CoCreate.config.js'), `module.exports = ${JSON.stringify({ organization_id, repositories: [] })}`);
    await fs.mkdir(nested, { recursive: true });
    const request = payload('object.create', { object: { name: 'shared workspace' } });
    const created = await invoke(nested, [JSON.stringify(request)]);
    assert.equal(created.code, 0, created.stderr);
    const read = await invoke(nested, [], payload('object.read'));
    assert.equal(read.code, 0, read.stderr);
    assert.equal(read.data.object[0].name, 'shared workspace');
});

test('the project supplies organization identity for an ordinary CRUD envelope', async t => {
    const { root } = await fixture(t);
    const result = await invoke(root, [JSON.stringify({ method: 'object.read', database: 'dev', array: 'records' })]);
    assert.equal(result.code, 0, result.stderr);
    assert.equal(result.data.organization_id, organization_id);
    assert.equal(result.data.success, true);
});

test('standalone DB defaults to the process working directory', async t => {
    const { root, directory } = await fixture(t);
    await fs.rename(directory, path.join(root, 'unused'));
    await fs.writeFile(path.join(root, 'CoCreate.config.js'), `module.exports = ${JSON.stringify({ organization_id, repositories: [] })}`);
    const result = await invoke(root, [], payload('object.create', { object: { name: 'standalone' } }));
    assert.equal(result.code, 0, result.stderr);
    await fs.access(path.join(root, organization_id));
});

test('an empty hierarchy bootstraps a key through CRUD with production/app defaults and no Socket credentials', async t => {
    const { root, directory } = await fixture(t);
    const id = '6c0000000000000000000008';
    const key = 'temporary-bootstrap-fixture';
    const created = await invoke(root, [], { method: 'object.create', array: 'keys', object: { _id: id, key, admin: true, status: 'active' } });
    assert.equal(created.code, 0, created.stderr);
    assert.equal(created.data.storage, 'production');
    assert.equal(created.data.database, 'app');
    assert.equal(created.data.organization_id, organization_id);
    assert.equal(created.data.object[0].admin, true);
    assert.equal(created.stdout.includes(key), false);
    const read = await invoke(root, [], { method: 'object.read', array: 'keys', filter: { query: { key } } });
    assert.equal(read.code, 0, read.stderr);
    assert.equal(read.data.object[0]._id, id);
    const files = await fs.readdir(path.join(directory, organization_id, 'storages'), { recursive: true });
    assert.ok(files.some(file => file.endsWith(`objects/${id}.json`)));
    assert.equal(files.includes('production'), false, 'Storage names resolve to ID directories');
});
