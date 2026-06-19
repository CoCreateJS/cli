#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);

/**
 * Detects which package manager is being used
 */
async function detectPackageManager() {
	const cwd = process.cwd();

	// Check for lock files in current directory
	const packageLockJson = path.join(cwd, "package-lock.json");
	if (fs.existsSync(packageLockJson)) {
		return "npm";
	}

	const pnpmLockYaml = path.join(cwd, "pnpm-lock.yaml");
	if (fs.existsSync(pnpmLockYaml)) {
		return "pnpm";
	}

	const yarnLock = path.join(cwd, "yarn.lock");
	if (fs.existsSync(yarnLock)) {
		return "yarn";
	}

	// Try to detect yarn if no lock files found
	try {
		await exec("yarn --version");
		return "yarn";
	} catch (e) {
		// Default to npm
	}

	return "npm";
}

/**
 * Prompts user for yes/no input
 */
function promptUser(question) {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
		});
	});
}

/**
 * Attempts to link the CLI globally
 */
async function linkGlobally() {
	try {
		const packageManager = await detectPackageManager();
		const linkCommand = `${packageManager} link`;
		const cliPath = path.resolve(__dirname, "..");

		// First, ask user if they want to install globally
		const wantGlobal = await promptUser(
			`[CoCreate CLI] Would you like to install @cocreate/cli globally? (yes/no): `
		);

		if (!wantGlobal) {
			console.log(
				`[CoCreate CLI] Skipped global installation. You can install later by running: ${linkCommand}`
			);
			return;
		}

		console.log(`[CoCreate CLI] Attempting global link using ${packageManager}...`);

		try {
			await exec(linkCommand, {
				cwd: cliPath
			});
			console.log(`[CoCreate CLI] Successfully linked globally via ${packageManager}`);
		} catch (error) {
			// Check if it's a permission error
			if (error.message && error.message.includes("EACCES")) {
				const platform = process.platform;
				const useSudo = platform === "linux" || platform === "darwin";

				if (useSudo) {
					// On Linux/macOS, offer to try with sudo
					const answer = await promptUser(
						`[CoCreate CLI] Permission denied. Try with sudo? (yes/no): `
					);

					if (answer) {
						try {
							const sudoCommand = `sudo ${linkCommand}`;
							console.log(
								`[CoCreate CLI] Attempting with sudo...`
							);
							await exec(sudoCommand, {
								cwd: cliPath,
								stdio: "inherit"
							});
							console.log(
								`[CoCreate CLI] Successfully linked globally with sudo`
							);
						} catch (sudoError) {
							console.warn(
								`[CoCreate CLI] Failed with sudo. Run this manually:`
							);
							console.warn(`  sudo ${linkCommand}`);
						}
					} else {
						console.warn(
							`[CoCreate CLI] Skipped. To link globally later, run:`
						);
						console.warn(`  ${linkCommand}`);
					}
				} else if (platform === "win32") {
					// Windows
					console.warn(
						`[CoCreate CLI] Permission denied. Please run Command Prompt as Administrator and retry npm install`
					);
				} else {
					// Other platforms
					console.warn(
						`[CoCreate CLI] Permission denied. You may need elevated privileges to link globally.`
					);
					console.warn(`  Run: ${linkCommand}`);
				}
			} else {
				// Other errors
				console.warn(
					`[CoCreate CLI] Failed to auto-link globally. Run this manually:`
				);
				console.warn(`  ${linkCommand}`);
			}
		}
	} catch (error) {
		console.warn("[CoCreate CLI] Postinstall linking encountered an issue.");
	}
}

// Run the linking process
linkGlobally().catch(() => {
	// Silently fail - don't break npm install
});
