const fs = require('node:fs/promises');
const path = require('node:path');

const usage = `Usage: coc crud [JSON | request.json]
With no argument, reads the same JSON envelope as coc send from stdin.
Calls CRUD server using its configured storage, without Socket authorization.`;

async function readStdin() {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    return input;
}

function stringifyResponse(response) {
    const secrets = new Set(['key', 'apikey', 'api_key', 'password', 'token', 'authorization',
        'connectionstring', 'privatekey', 'clientsecret', 'secret', 'secretaccesskey']);
    return JSON.stringify(response, (key, value) => secrets.has(key.toLowerCase()) ? '[redacted]' : value, 2);
}

/**
 * Execute a local CRUD envelope through CRUD server without a Socket connection.
 * @name crud
 * @kind function
 * @environment server
 */
module.exports = async function crud(repositories, args = [], projectConfig = {}) {
    if (args.includes('--help') || args.includes('-h')) {
        process.stdout.write(`${usage}\n`);
        return [];
    }
    try {
        let input = args.length ? args.join(' ') : await readStdin();
        if (!input.trim()) throw new Error('Provide a JSON envelope, a JSON file, or stdin.');
        try { input = await fs.readFile(path.resolve(input.trim()), 'utf8'); }
        catch (error) { if (!['ENOENT', 'ENAMETOOLONG', 'ENOTDIR', 'EINVAL'].includes(error.code)) throw error; }
        const payload = JSON.parse(input);
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('The envelope must be a JSON object.');
        if (!/^(storage|database|array|index|object)\.(create|read|update|delete)$/.test(payload.method)) {
            throw new Error('The envelope requires a supported CRUD method, such as object.read.');
        }
        const organization_id = payload.organization_id || projectConfig.organization_id;
        if (typeof organization_id !== 'string' || !organization_id.trim()) throw new Error('An organization_id is required.');
        const { default: Crud } = await import('@cocreate/crud/server');
        const host = typeof payload.host === 'string' ? payload.host :
            typeof projectConfig.host === 'string' ? projectConfig.host : undefined;
        const instance = await Crud.init(undefined, { config: {
            ...projectConfig, organization_id, host
        } });
        const response = await instance.send({ ...payload, organization_id });
        process.stdout.write(`${stringifyResponse(response)}\n`);
        if (!response || response.success === false ||
            (Array.isArray(response.error) ? response.error.length : response.error)) process.exitCode = 1;
        return [];
    } catch (error) {
        // JSON parser errors can contain fragments of a credential-bearing input.
        const message = error instanceof SyntaxError ? 'The envelope must contain valid JSON.' : error.message;
        console.error(`CRUD failed: ${message}`);
        process.exitCode = 1;
        return [];
    }
};
