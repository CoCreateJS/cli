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

	if (!config || !config.modules) {
		console.error("Failed to read or parse CoCreate.config.js.");
		return;
	}

	const storages = [];

	for (const module of Object.values(config.modules)) {
		if (!module.path) continue;

		const normalizedPath = path.normalize(module.path);

		// Only process storage repositories
		if (
			!normalizedPath.includes(
				`${path.sep}CoCreate-storages${path.sep}`
			)
		)
			continue;

		// Repository name (ex: CoCreate-mongodb)
		const repositoryName = path.basename(normalizedPath);

		// Storage name (ex: mongodb)
		const storageName = repositoryName.replace(/^CoCreate-/, "");

		storages.push({
			name: storageName,
			storageSource: path.resolve(
				module.path,
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