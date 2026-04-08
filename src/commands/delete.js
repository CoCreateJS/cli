const file = require("@cocreate/file");
const path = require("path");
const fs = require("fs");
const { getConfig } = require("../getConfig");

module.exports = async function del(directory, args) {
	if (args && !Array.isArray(args)) args = [args];

	directory = process.cwd();

	// Process targets
	if (!args || !args.length) {
		const CoCreateConfig = await getConfig(directory);
		if (CoCreateConfig && CoCreateConfig.configPath) {
			const projectRoot = path.dirname(CoCreateConfig.configPath);
			let rel = path.relative(projectRoot, process.cwd()).replace(/\\/g, '/');

			// In the DB, 'src' is the root, so we must remove 'src' from the relative path
			if (rel === 'src') {
				rel = '';
			} else if (rel.startsWith('src/')) {
				rel = rel.substring(4);
			} else if (rel === 'src') {
				rel = '';
			}

			let target = '/' + rel.replace(/^\/+/, '');

			await confirmAndDelete(CoCreateConfig, target);
		} else {
			console.log("Failed to read or parse CoCreate.config.js.");
		}
	} else {
		// When explicit args are given, resolve config but do NOT change CWD
		const CoCreateConfig = await getConfig(directory);
		if (!CoCreateConfig || !CoCreateConfig.configPath) {
			console.log("Failed to read or parse CoCreate.config.js for authentication.");
			return;
		}

		for (let arg of args) {
			let targetPath = String(arg).replace(/\\/g, '/');

			// Normalize to DB path format
			if (!targetPath.startsWith('/')) {
				targetPath = '/' + targetPath.replace(/^\/+/,'');
			}

			await confirmAndDelete(CoCreateConfig, targetPath);
		}
	}

	async function confirmAndDelete(CoCreateConfig, target) {
		try {
			if (typeof file.delete !== 'function') {
				console.error('Delete not supported: @cocreate/file exposes no delete API.');
				return;
			}

			const res = await file.delete(
				CoCreateConfig,
				CoCreateConfig.configPath,
				target
			);
			console.log('Deleted:', (res && res.length) ? res.length : res, 'items for', target);
		} catch (err) {
			console.error('Delete failed for', target, err);
		}
	}
};
