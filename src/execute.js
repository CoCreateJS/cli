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

    // --- CONSOLIDATE REPOSITORIES ---
    // Merge both modules and projects from the new configuration structure
    let targetRepos = [];
    
    if (config.modules) {
        Object.entries(config.modules).forEach(([name, repo]) => {
            // Ensure it's a valid object and has a path
            if (typeof repo === 'object' && repo !== null && repo.path) {
                targetRepos.push({ name, ...repo });
            }
        });
    }
    
    if (config.projects) {
        Object.entries(config.projects).forEach(([name, repo]) => {
            if (typeof repo === 'object' && repo !== null && repo.path) {
                targetRepos.push({ name, ...repo });
            }
        });
    }

    // Backward compatibility for transitioning configs
    if (config.repositories && Array.isArray(config.repositories)) {
        targetRepos = targetRepos.concat(config.repositories);
    }

    for (let repo of targetRepos) {
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

            console.log(color.green + `${repo.name || repo.path}: ` + color.reset, command);
            let exitCode = 0;
            if (config.hideMessage) {
                try {
                    await exec(command, {
                        cwd: repo.absolutePath || path.resolve(repo.path)
                    });
                } catch (error) {
                    exitCode = 1;
                }
            } else {
                // Use spawn with shell to stream output in real-time
                exitCode = await spawn(type, args, {
                    cwd: repo.absolutePath || path.resolve(repo.path),
                    shell: true,
                    stdio: "inherit"
                });
            }

            if (exitCode !== 0) {
                repo.error = "command failed: " + command;
                failed.push(repo);
            }
        } catch (err) {
            console.error(
                color.red +
                    `an error occured executing command in ${repo.name || repo.path} repository` +
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