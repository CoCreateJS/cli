#!/usr/bin/env node

// Import necessary modules for path operations, file system operations, and more
const path = require("path");
const readline = require("readline");
const execute = require("./execute");
const addMeta = require("./addMeta");
const { color } = require("./fonts");
const { getConfig } = require("./getConfig");
const fsp = require('fs').promises;

// Configuration object for storing options
let config = {};

// Extract arguments from the command line input
const argv = process.argv.slice(2);

// Define available command-line options
const availableOptions = {
	"--self": { key: "self", type: "boolean" },
	"-s": { key: "self", type: "boolean" },
	"--directory": { key: "directory", type: "string" },
	"-d": { key: "directory", type: "string" },
	"--config": { key: "config", type: "string" },
	"-c": { key: "config", type: "string" }
};

const options = {};
const commandParts = [];
for (let i = 0; i < argv.length; i++) {
	let option = availableOptions[argv[i]];
	if (option) {
		if (option.type === "boolean") {
			options[option.key] = true;
		} else if (option.type === "string") {
			options[option.key] = argv[i + 1];
			argv.splice(i + 1, 1);
		}
	} else {
		if (argv[i].match(/[\s'"]/)) {
			commandParts.push(`'${argv[i].replace(/'/g, "\\'")}'`);
		} else {
			commandParts.push(argv[i]);
		}
	}
}

command = commandParts.join(" ");

/**
 * Main function to execute commands across repositories.
 * @param {Object} config - The configuration object.
 * @param {Array} [repos=null] - List of repositories to process.
 * @param {string} [directory=null] - The directory path of the configuration.
 */
async function main(config = {}, options) {
	let directory = options["directory"] || process.cwd();
	if (!config.repositories) {
		let configString = options["config"];
		if (configString) {
			try {
				config = JSON.parse(configString);
				console.warn(
					`${color.yellow}using supplied JSON configuration${color.reset}`
				);
			} catch (error) {
				directory = configString;
				config = await getConfig(directory);
			}
		} else {
			config = await getConfig(directory);
		}

		if (!config.configPath) {
			const package = await getConfig(directory, "package.json");
			if (package.configPath) {
				config.configPath = package.configPath;
				const repoUrl =
					package.repository && package.repository.url.substring(12);
				config.repositories = [
					{
						path: package.configPath,
						repo: repoUrl,
						entry: package.main
					}
				];
			} else {
				console.warn(
					`${color.yellow}CoCreate.config.js not found. Generating a new one...${color.reset}`
				);

				const templatePath = path.resolve(__dirname, './config.template.js');
				let templateConfig;
				try {
					templateConfig = require(templatePath);
				} catch (e) {
					console.error(`${color.red}Error loading config.template.js:`, e, color.reset);
					process.exit(1);
				}
				
				// Customize the template with repository information from package.json
				const currentRepoPath = '.'; // Current directory where config is generated
				const repoUrl = package.repository && package.repository.url ? package.repository.url.substring(package.repository.url.indexOf('://') + 3) : '';

				templateConfig.repositories = [
					{
						path: currentRepoPath,
						repo: repoUrl,
						exclude: ["git"]
					}
				];
				
				// Set initial organization_id and key from environment or placeholders
				templateConfig.organization_id = process.env.organization_id || "YOUR_ORGANIZATION_ID";
				templateConfig.key = process.env.key || "YOUR_API_KEY";
				
				// Resolve host domain if available from environment variable HOST_DOMAIN
				if (process.env.host_domain) {
					templateConfig.host.$branch.master = `wss://${process.env.host_domain}`;
					templateConfig.host.$branch.dev = `wss://dev.${process.env.host_domain}`;
					templateConfig.host.$branch.test = `wss://test.${process.env.host_domain}`;
				}


				const newConfigPath = path.join(directory, 'CoCreate.config.js');
				const configContent = `module.exports = ${JSON.stringify(templateConfig, null, 2)};`;

				await fsp.writeFile(newConfigPath, configContent);

				console.log(`${color.green}Generated CoCreate.config.js at ${newConfigPath}${color.reset}`);

				// Use the newly generated template config
				config = templateConfig;
				config.configPath = newConfigPath; // Ensure configPath is set to the new file
			}
		}
	}

	directory = path.dirname(config.configPath);
	console.warn(
		`${color.yellow}using config ${config.configPath} ${color.reset}`
	);

	config.hideMessage = false;

	// Add metadata to repositories if any are present
	if (config.repositories && config.repositories.length) {
		config.repositories = await addMeta(config.repositories, [], directory);
	}

	// Execute the command across repositories
	const failed = await execute(command, config);

	// Handle any failed command executions
	if (failed && failed.length > 0) {
		console.log(
			color.red +
				" **************** failures **************** " +
				color.reset
		);
		for (const failure of failed) {
			console.log(
				color.red + `${failure.name}: ${failure.error}` + color.reset
			);
		}

		// Prompt user to retry failed commands
		await promptRetry(failed, config, options);
	}
}

/**
 * Prompt the user to retry failed commands.
 * @param {Array} failed - List of failed commands.
 * @param {Object} config - Configuration object.
 * @param {string} directory - Path of the configuration directory.
 */
async function promptRetry(failed, config, options) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.question(
		"Do you want to retry the failed commands? (yes/no): ",
		async (answer) => {
			rl.close();
			if (answer.toLowerCase() === "yes") {
				config.repositories = failed;
				await main(config, options);
			} else {
				process.exit(0);
			}
		}
	);
}

// Call the main function with initial configuration
main(config, options);
