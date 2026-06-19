const path = require("path");
const fs = require("fs");
const spawn = require("./spawn");
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const { getConfig } = require("./getConfig");

const { color } = require("./fonts");

module.exports = async function execute(command, config) {
	let failed = [];
	let [filename, ...args] = command.replaceAll("'", '"').trim().split(" ");

	let type;

	if (filename.endsWith(".js")) {
		type = filename.slice(0, -3);
	} else {
		type = filename;
		filename += ".js";
	}

	let predefined = path.resolve(__dirname, "commands", filename);
	let isPredefined = fs.existsSync(predefined);
	let repositories = [];

	for (let repo of config.repositories || []) {
		try {
			if (
				repo.exclude &&
				(repo.exclude.includes(type) || repo.exclude.includes(filename))
			) {
				continue;
			}

			const packageJsonPath = path.resolve(repo.path, "package.json");
			
			// Try to load package.json if it exists
			if (fs.existsSync(packageJsonPath)) {
				try {
					const packageObj = require(packageJsonPath);
					repo.entry = packageObj.main;
				} catch (err) {
					// Log error but continue
					console.error("error reading packageObj:", err.message);
				}
			}

			if (isPredefined) {
				repositories.push(repo);
				continue;
			}

			// For non-predefined commands, skip if package.json doesn't exist
			if (!fs.existsSync(packageJsonPath)) {
				continue;
			}

			console.log(color.green + `${repo.name}: ` + color.reset, command);
			let exitCode = 0;
			if (config.hideMessage) {
				try {
					await exec(command, {
						cwd: repo.absolutePath
					});
				} catch (error) {
					exitCode = 1;
				}
			} else {
				// Properly escape arguments when using shell
				const escapedArgs = args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ');
				const commandStr = escapedArgs ? `${type} ${escapedArgs}` : type;
				
				try {
					await exec(commandStr, {
						cwd: repo.absolutePath,
						stdio: "inherit"
					});
				} catch (error) {
					exitCode = 1;
				}
			}

			if (exitCode !== 0) {
				repo.error = "command failed: " + command;
				failed.push(repo);
			}
		} catch (err) {
			console.error(
				color.red +
					`an error occured executing command in ${repo.name} repository` +
					color.reset,
				err.message
			);
		}
	}

	if (isPredefined) {
		failed = await require(predefined)(repositories, args);
	}

	return failed;
};
