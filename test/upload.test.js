const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { createRequire } = require('node:module');
const test = require('node:test');
const { Server: WebSocketServer } = createRequire(require.resolve('@cocreate/socket-client'))('ws');
const exec = promisify(execFile);
const cli = path.resolve(__dirname, '../src/coc.js');

function workspace(t, config) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'coc-cli-upload-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    fs.writeFileSync(path.join(directory, 'CoCreate.config.js'), `module.exports = ${JSON.stringify(config)};`);
    return directory;
}

test('coc upload stays quiet for an empty upload config', async (t) => {
    const cwd = workspace(t, {});
    const result = await exec(process.execPath, [cli, 'upload'], { cwd, timeout: 3000 });
    assert.equal(result.stdout, '');
});

for (const denied of [false, true]) {
    test(`coc upload receives ${denied ? 'errors' : 'confirmation'} with broadcastSender false`, async (t) => {
        const server = new WebSocketServer({ port: 0, host: '127.0.0.1' });
        t.after(async () => {
            for (const socket of server.clients) socket.terminate();
            await new Promise((resolve) => server.close(resolve));
        });
        await new Promise((resolve) => server.once('listening', resolve));
        const requests = [];
        let earlyRequests = 0;
        server.on('connection', (socket) => {
            let ready = false;
            const timer = setTimeout(() => {
                ready = true;
                socket.send(JSON.stringify({ method: 'connect', connectedKey: '/test' }));
            }, 50);
            socket.on('close', () => clearTimeout(timer));
            socket.on('message', (payload) => {
                if (!ready) {
                    earlyRequests++;
                    return;
                }
                const data = JSON.parse(payload);
                requests.push(data);
                socket.send(JSON.stringify({
                    ...data,
                    broadcastSender: false,
                    ...(denied ? { error: 'write denied' } : { object: [{ _id: 'saved' }] })
                }));
            });
        });
        const cwd = workspace(t, {
            organization_id: 'test', apikey: 'test',
            host: `ws://127.0.0.1:${server.address().port}`,
            directories: [{ entry: './src', object: { src: '{{source}}' } }]
        });
        fs.mkdirSync(path.join(cwd, 'src'));
        fs.writeFileSync(path.join(cwd, 'src', 'example.txt'), 'example');
        fs.writeFileSync(path.join(cwd, 'src', 'second.txt'), 'second');
        fs.mkdirSync(path.join(cwd, 'src', 'nested'));
        fs.writeFileSync(path.join(cwd, 'src', 'nested', 'third.txt'), 'third');
        let result;
        try {
            result = await exec(process.execPath, [cli, 'upload'], { cwd, timeout: 3000 });
            assert.equal(denied, false);
        } catch (error) {
            if (!denied) throw error;
            assert.equal(error.code, 1);
            result = error;
        }
        assert.equal(earlyRequests, 0);
        assert.equal(requests.length, 4);
        assert.equal(new Set(requests.map(request => request.uuid)).size, 4);
        assert.equal(requests[0].method, 'object.update');
        assert.equal(requests[0].object.src, 'example');
        assert.doesNotMatch(result.stdout, /Uploading|Upload complete|Still waiting/);
        if (!denied) assert.equal(result.stdout.trim().split('\n').length, 4);
        if (denied) assert.doesNotMatch(result.stdout, /Uploaded:/);
        else assert.match(result.stdout, /Uploaded:/);
    });
}
