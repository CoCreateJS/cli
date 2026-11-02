const { collectDocumentation } = require("./docs");

const supportedFlags = new Set([
	"--api",
	"--declarative",
	"--client",
	"--server"
]);

function getEnvironment(doclet, fallback) {
	const tag = (Array.isArray(doclet.tags) ? doclet.tags : []).find((item) =>
		String(item.title || item.originalTitle || "").toLowerCase() === "environment"
	);
	if (!tag) return fallback;
	const values = String(tag.value || "")
		.split(/[\s,|]+/)
		.map((value) => value.toLowerCase())
		.filter((value) => value === "client" || value === "server");
	return values.length ? values : fallback;
}

function selectModule(module, section, selectedEnvironments) {
	const moduleEnvironments = Array.isArray(module.environment) && module.environment.length
		? module.environment
		: ["client", "server"];
	const environments = selectedEnvironments.filter((environment) =>
		moduleEnvironments.includes(environment)
	);
	if (!environments.length) return null;

	const doclets = Array.isArray(module.doclets) ? module.doclets : [];
	const api = Array.isArray(module.api)
		? module.api
		: doclets.filter((doclet) => doclet.kind !== "attribute");
	const declarative = Array.isArray(module.declarative)
		? module.declarative
		: doclets.filter((doclet) => doclet.kind === "attribute");
	const byEnvironments = (entries) => entries.filter((doclet) =>
		environments.some((environment) =>
			getEnvironment(doclet, moduleEnvironments).includes(environment)
		)
	);
	const output = {
		name: module.name,
		packageName: module.packageName || null,
		type: module.type,
		environment: environments
	};

	if (section) {
		output[section] = byEnvironments(section === "api" ? api : declarative);
	} else {
		output.api = byEnvironments(api);
		output.declarative = byEnvironments(declarative);
	}
	return output;
}

module.exports = async function interfaceCommand(repos = [], args = [], config = {}) {
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
		: flags.has("--declarative") ? "declarative" : null;
	const selectedEnvironments = ["client", "server"].filter((environment) =>
		flags.has(`--${environment}`)
	);
	const dataset = await collectDocumentation(repos, config);
	const interfaces = dataset.modules
		.map((module) => selectModule(
			module,
			section,
			selectedEnvironments.length ? selectedEnvironments : ["client", "server"]
		))
		.filter(Boolean);
	console.log(JSON.stringify(interfaces, null, 2));
};

module.exports.selectModule = selectModule;
