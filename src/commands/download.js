const file = require("@cocreate/file");
const path = require("path");
const fs = require("fs");
const { getConfig } = require("../getConfig");

module.exports = async function download(directory, args) {
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
			
			await fetchAndWrite(CoCreateConfig, target);
		} else {
			console.log("Failed to read or parse CoCreate.config.js.");
		}
	} else {
		// When an explicit argument is given, resolve config but do NOT change CWD
		// so that the files are downloaded into the folder output was initiated from.
		const CoCreateConfig = await getConfig(directory);
		if (!CoCreateConfig || !CoCreateConfig.configPath) {
			console.log("Failed to read or parse CoCreate.config.js for authentication.");
			return;
		}

		for (let arg of args) {
			let targetPath = String(arg).replace(/\\/g, '/');
			
			// Just use the requested string directly as the DB path
			if (!targetPath.startsWith('/')) {
				targetPath = '/' + targetPath.replace(/^\/+/, '');
			}
			
			await fetchAndWrite(CoCreateConfig, targetPath);
		}
	}

	async function fetchAndWrite(CoCreateConfig, target) {
		try {
			if (typeof file.download !== 'function') {
				console.error('Download not supported: @cocreate/file exposes no download API.');
				return;
			}

			const downloaded = await file.download(
				CoCreateConfig,
				CoCreateConfig.configPath,
				target
			);
			console.log('Downloaded:', downloaded && downloaded.length ? downloaded.length : 0, 'files for', target);
		} catch (err) {
			console.error('Download failed for', target, err);
		}
	}
};

