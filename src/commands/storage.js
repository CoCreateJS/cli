const fs = require("fs");
const path = require("path");
const { getConfig } = require("../getConfig");

module.exports = async function storage(directory, args) {
	if (args && !Array.isArray(args)) args = [args];

	const isWatch =
		args &&
		(args.includes("-w") || args.includes("--watch"));

	const cwd = process.cwd();

	// CRUD Server storage directory
	const storageDestinationDirectory = path.resolve(cwd, "storage");

	await fs.promises.mkdir(storageDestinationDirectory, {
		recursive: true
	});

	const config = await getConfig(cwd);

	if (!config || (!config.storages && !config.modules)) {
		console.error("Failed to read or parse CoCreate.config.js.");
		return;
	}

	const storages = [];

	const configuredStorages = config.storages
		? Object.entries(config.storages)
		: Object.entries(config.modules || {}).filter(([, module]) => {
			if (!module?.path) return false;
			return path.normalize(module.path).includes(
				`${path.sep}CoCreate-storages${path.sep}`
			);
		});

	for (const [name, repository] of configuredStorages) {
		if (!repository?.path) continue;

		// Legacy configs infer storage names from the repository directory.
		const storageName = config.storages
			? name
			: path.basename(path.normalize(repository.path)).replace(/^CoCreate-/, "");

		storages.push({
			name: storageName,
			storageSource: path.resolve(
				repository.path,
				"dist",
				`${storageName}.js`
			),
			storageDestination: path.resolve(
				storageDestinationDirectory,
				`${storageName}.js`
			)
		});
	}

	if (!storages.length) {
		console.log("No storage repositories found.");
		return;
	}

	// Initial copy
	for (const storage of storages) {
		await copyStorage(storage);
	}

	if (!isWatch) return;

	console.log("\nWatching storage files...\n");

	for (const storage of storages) {
		if (!fs.existsSync(storage.storageSource)) {
			console.warn(
				`Storage source not found: ${storage.storageSource}`
			);
			continue;
		}

		let debounce;

		fs.watch(storage.storageSource, (eventType) => {
			if (eventType !== "change") return;

			clearTimeout(debounce);

			debounce = setTimeout(async () => {
				await copyStorage(storage);
			}, 100);
		});

		console.log(
			`Watching ${storage.name}: ${storage.storageSource}`
		);
	}
};

async function copyStorage(storage) {
	try {
		if (!fs.existsSync(storage.storageSource)) {
			console.warn(
				`Storage source not found: ${storage.storageSource}`
			);
			return;
		}

		await fs.promises.copyFile(
			storage.storageSource,
			storage.storageDestination
		);

		console.log(
			`Copied ${storage.name}.js`
		);
	} catch (err) {
		console.error(
			`Failed copying ${storage.name}:`,
			err.message
		);
	}
}
