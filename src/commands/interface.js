const fs = require("fs");
const path = require("path");

const supportedFlags = new Set([
	"--api",
	"--declarative",
	"--client",
	"--server"
]);

function filterInterface(contract, section, environments) {
	const output = {};
	for (const key of ["schemaVersion", "summary", "source", "sources", "status"]) {
		if (contract[key] !== undefined) output[key] = contract[key];
	}

	const hasEnvironmentBranches = Boolean(contract.client || contract.server);
	if (hasEnvironmentBranches) {
		for (const environment of environments) {
			const branch = contract[environment];
			if (!branch) continue;
			const filteredBranch = {};
			for (const key of ["source", "sources", "summary", "status"]) {
				if (branch[key] !== undefined) filteredBranch[key] = branch[key];
			}
			if (section) {
				if (branch[section] !== undefined) filteredBranch[section] = branch[section];
			} else {
				for (const key of ["declarative", "api"]) {
					if (branch[key] !== undefined) filteredBranch[key] = branch[key];
				}
			}
			output[environment] = filteredBranch;
		}
		return output;
	}

	if (section) {
		if (contract[section] !== undefined) output[section] = contract[section];
	} else {
		for (const key of ["declarative", "api"]) {
			if (contract[key] !== undefined) output[key] = contract[key];
		}
	}
	return output;
}

module.exports = async function interfaceCommand(repos = [], args = []) {
	const flags = new Set(args);
	const unknownFlags = args.filter((arg) => arg.startsWith("-") && !supportedFlags.has(arg));
	const positionalArgs = args.filter((arg) => !arg.startsWith("-"));
	if (unknownFlags.length || positionalArgs.length) {
		const invalid = [...unknownFlags, ...positionalArgs];
		console.error(`Unknown interface option: ${invalid.join(", ")}`);
		console.error("Usage: coc interface [--api | --declarative] [--client] [--server]");
		process.exitCode = 1;
		return;
	}

	if (flags.has("--api") && flags.has("--declarative")) {
		console.error("Choose either --api or --declarative.");
		process.exitCode = 1;
		return;
	}

	const section = flags.has("--api")
		? "api"
		: flags.has("--declarative")
			? "declarative"
			: null;
	const environments = ["client", "server"].filter((environment) =>
		flags.has(`--${environment}`)
	);
	const selectedEnvironments = environments.length ? environments : ["client", "server"];
	const interfaces = [];
	const seen = new Set();

	for (const repo of repos) {
		const repoPath = repo.absolutePath || (repo.path && path.resolve(repo.path));
		if (!repoPath) continue;

		const packageJsonPath = path.join(repoPath, "package.json");
		if (!fs.existsSync(packageJsonPath)) continue;

		let pkg;
		try {
			pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
		} catch (error) {
			console.error(`Unable to read ${packageJsonPath}: ${error.message}`);
			continue;
		}

		const contract = pkg.cocreate?.interface;
		if (!contract) continue;

		const environment = Array.isArray(pkg.cocreate.environment)
			? pkg.cocreate.environment
			: ["client", "server"];
		const matchingEnvironments = selectedEnvironments.filter((name) => environment.includes(name));
		if (!matchingEnvironments.length) continue;

		const identity = pkg.name || repo.packageName || repo.name || repoPath;
		if (seen.has(identity)) continue;
		seen.add(identity);

		interfaces.push({
			name: identity,
			version: pkg.version,
			environment: matchingEnvironments,
			interface: filterInterface(contract, section, matchingEnvironments)
		});
	}

	console.log(JSON.stringify(interfaces, null, 2));
};
