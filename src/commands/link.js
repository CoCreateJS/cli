const spawn = require("../spawn");
const path = require("path");
const fs = require("fs");
const { color } = require("../fonts");

const isWindows = process.platform === "win32";

/**
 * Parses local configuration files (.npmrc or .yarnrc) to detect if an 
 * external node_modules target directory has been configured.
 * Fallback to standard process.cwd()/node_modules.
 */
function getTargetNodeModulesPath() {
    const cwd = process.cwd();
    
    // Check for .npmrc config
    const npmrcPath = path.join(cwd, ".npmrc");
    if (fs.existsSync(npmrcPath)) {
        const content = fs.readFileSync(npmrcPath, "utf-8");
        const match = content.match(/^modules-dir\s*=\s*(.+)$/m);
        if (match && match[1]) {
            return path.resolve(cwd, match[1].trim());
        }
    }

    // Check for .yarnrc config (Yarn v1)
    const yarnrcPath = path.join(cwd, ".yarnrc");
    if (fs.existsSync(yarnrcPath)) {
        const content = fs.readFileSync(yarnrcPath, "utf-8");
        const match = content.match(/^--modules-folder\s+["']?([^"'\r\n]+)["']?$/m);
        if (match && match[1]) {
            return path.resolve(cwd, match[1].trim());
        }
    }

    // Default to the standard local path
    return path.resolve(cwd, "node_modules");
}

/**
 * Detects the active package manager based on workspace lockfiles.
 */
function detectPackageManager() {
    const cwd = process.cwd();
    if (fs.existsSync(path.join(cwd, "yarn.lock"))) {
        return "yarn";
    }
    if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
        return "pnpm";
    }
    if (fs.existsSync(path.join(cwd, "package-lock.json"))) {
        return "npm";
    }
    return "npm"; // Default fallback
}

module.exports = async (repos, args) => {
    const failed = [];
    const packageManager = detectPackageManager();
    
    // Resolve the actual directory where node_modules lives (respecting external dotfiles)
    const targetNodeModules = getTargetNodeModulesPath();
    
    console.log(
        color.cyan + 
        `[coc] Active Package Manager: ${packageManager.toUpperCase()}` + 
        color.reset
    );
    console.log(
        color.cyan + 
        `[coc] Targeted node_modules directory: ${targetNodeModules}\n` + 
        color.reset
    );

    // Ensure the target node_modules folder exists
    if (!fs.existsSync(targetNodeModules)) {
        await fs.promises.mkdir(targetNodeModules, { recursive: true });
    }

    for (let repo of repos) {
        if (!repo) continue;
        if (repo.exclude && repo.exclude.includes("link")) continue;
        if (process.cwd() === repo.absolutePath) continue;

        try {
            // Check if the user explicitly requested fast-mode manual symlinking via a flag.
            // Otherwise, we default to spawning native commands for clean, transparent output.
            const useDirectSymlink = args && args.includes("--fast");

            if (useDirectSymlink) {
                // Keep the manual symlink option as a lightweight fallback
                const linkDestination = path.join(targetNodeModules, repo.packageName);
                const sourcePath = path.resolve(repo.absolutePath);

                // Clean up destination and symlink
                await fs.promises.mkdir(path.dirname(linkDestination), { recursive: true });
                try {
                    const stat = await fs.promises.lstat(linkDestination);
                    if (stat.isSymbolicLink() || stat.isFile()) {
                        await fs.promises.unlink(linkDestination);
                    } else {
                        await fs.promises.rm(linkDestination, { recursive: true, force: true });
                    }
                } catch (e) {}

                const type = isWindows ? "junction" : "dir";
                await fs.promises.symlink(sourcePath, linkDestination, type);

                console.log(
                    color.green + 
                    `[link] Symlinked: ${repo.packageName} -> ${repo.absolutePath}` + 
                    color.reset
                );
            } else {
                // DEFAULT NATIVE SPAWN MODE
                // Show clean headers before spawning the command so it's clear what is happening
                console.log(
                    color.yellow + 
                    `Executing: ${packageManager} link (inside ${repo.absolutePath})` + 
                    color.reset
                );
                
                // Step 1: Register the package globally from its source directory
                let regCode = await spawn(packageManager, ["link"], {
                    cwd: repo.absolutePath,
                    shell: true,
                    stdio: "inherit" // Repeats the native stdout/stderr response directly
                });

                if (regCode !== 0) {
                    throw new Error(`Global registration failed inside ${repo.absolutePath}`);
                }

                console.log(
                    color.yellow + 
                    `Executing: ${packageManager} link ${repo.packageName} (inside ${process.cwd()})` + 
                    color.reset
                );

                // Step 2: Link registered package to host application (respects external node_modules configurations!)
                let linkCode = await spawn(packageManager, ["link", repo.packageName], {
                    cwd: process.cwd(),
                    shell: true,
                    stdio: "inherit" // Repeats the native stdout/stderr response directly
                });

                if (linkCode !== 0) {
                    throw new Error(`Link execution failed inside host directory`);
                }
                
                console.log(""); // Clean spacing line
            }

        } catch (err) {
            failed.push({
                name: repo.name,
                error: err.message
            });
            console.error(
                color.red +
                `Failed to link ${repo.name}: ${err.message}` +
                color.reset
            );
        }
    }

    return failed;
};