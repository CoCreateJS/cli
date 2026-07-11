const spawn = require("../spawn");
const path = require("path");
const fs = require("fs");
const { color } = require("../fonts");
const getPackageManager = require("../getPackageManager");
const getOS = require("../getOS");

const { isWindows } = getOS();

/**
 * Parses local configuration files (.npmrc or .yarnrc) to detect if an 
 * external node_modules target directory has been configured.
 * Fallback to standard process.cwd()/node_modules.
 * 
 * NOTE: We only need this manual parsing for the custom `--fast` direct 
 * symlinking mode. When spawning native package manager commands, the PMs
 * natively read these files automatically.
 */
function getTargetNodeModulesPath() {
    const cwd = process.cwd();
    
    // Check for .npmrc config (e.g. used by pnpm or custom npm setups)
    const npmrcPath = path.join(cwd, ".npmrc");
    if (fs.existsSync(npmrcPath)) {
        try {
            const content = fs.readFileSync(npmrcPath, "utf-8");
            // Match "modules-dir = path" while ignoring comments (# or ;) and handling spaces/quotes
            const match = content.match(/^\s*modules-dir\s*=\s*["']?([^"'\r\n#;]+)["']?/m);
            if (match && match[1]) {
                return path.resolve(cwd, match[1].trim());
            }
        } catch (e) {
            // Gracefully ignore reading errors and fallback
        }
    }

    // Check for .yarnrc config (Yarn Classic v1)
    const yarnrcPath = path.join(cwd, ".yarnrc");
    if (fs.existsSync(yarnrcPath)) {
        try {
            const content = fs.readFileSync(yarnrcPath, "utf-8");
            // Match "--modules-folder path" or "--install.modules-folder path" handling quotes
            const match = content.match(/^\s*--(?:install\.)?modules-folder\s+["']?([^"'\r\n#]+)["']?/m);
            if (match && match[1]) {
                return path.resolve(cwd, match[1].trim());
            }
        } catch (e) {
            // Gracefully ignore reading errors and fallback
        }
    }

    // Default to the standard local path if no configs are present
    return path.resolve(cwd, "node_modules");
}

module.exports = async (repos, args) => {
    const failed = [];
    const packageManager = getPackageManager();
    
    // Determine the actual binary execution name
    const binName = (packageManager === "yarn-classic" || packageManager === "yarn-berry") 
        ? "yarn" 
        : packageManager;
    
    // Check if the user explicitly requested fast-mode manual symlinking via a flag.
    const useDirectSymlink = args && args.includes("--fast");
    let targetNodeModules = null;

    console.log(
        color.cyan + 
        `[coc] Active Package Manager: ${packageManager.toUpperCase()}` + 
        color.reset
    );

    if (useDirectSymlink) {
        // We only parse configurations manually if we are doing direct symlinking bypass
        targetNodeModules = getTargetNodeModulesPath();
        
        console.log(
            color.cyan + 
            `[coc] [Fast Mode] Targeted node_modules directory: ${targetNodeModules}\n` + 
            color.reset
        );

        // Ensure the manual target node_modules folder exists
        if (!fs.existsSync(targetNodeModules)) {
            await fs.promises.mkdir(targetNodeModules, { recursive: true });
        }
    } else {
        // Native linking reads these configurations automatically, so we skip file-system overhead here
        console.log(""); 
    }

    for (let repo of repos) {
        if (!repo) continue;
        if (repo.exclude && repo.exclude.includes("link")) continue;
        if (process.cwd() === repo.absolutePath) continue;

        try {
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
                
                // --- 1-STEP DIRECT PATH LINKING (pnpm & Yarn Berry) ---
                if (packageManager === "pnpm" || packageManager === "yarn-berry") {
                    console.log(
                        color.yellow + 
                        `Executing: ${binName} link ${repo.absolutePath} (inside ${process.cwd()})` + 
                        color.reset
                    );

                    if (packageManager === "yarn-berry") {
                        console.log(
                            color.cyan + 
                            `💡 Note: Yarn Berry will modify package.json with a resolutions block mapping to your local path.` + 
                            color.reset
                        );
                    }

                    let linkCode = await spawn(binName, ["link", repo.absolutePath], {
                        cwd: process.cwd(),
                        shell: true,
                        stdio: "inherit"
                    });

                    if (linkCode !== 0) {
                        throw new Error(`Direct-path linking execution failed for ${repo.packageName}`);
                    }
                    
                } else {
                    // --- 2-STEP GLOBAL REGISTRY LINKING (npm, Yarn Classic, Bun) ---
                    console.log(
                        color.yellow + 
                        `Executing: ${binName} link (inside ${repo.absolutePath})` + 
                        color.reset
                    );
                    
                    // Step 1: Register the package globally from its source directory
                    let regCode = await spawn(binName, ["link"], {
                        cwd: repo.absolutePath,
                        shell: true,
                        stdio: "inherit"
                    });

                    if (regCode !== 0) {
                        throw new Error(`Global registration failed inside ${repo.absolutePath}`);
                    }

                    console.log(
                        color.yellow + 
                        `Executing: ${binName} link ${repo.packageName} (inside ${process.cwd()})` + 
                        color.reset
                    );

                    // Step 2: Link registered package to host application
                    let linkCode = await spawn(binName, ["link", repo.packageName], {
                        cwd: process.cwd(),
                        shell: true,
                        stdio: "inherit"
                    });

                    if (linkCode !== 0) {
                        throw new Error(`Link execution failed inside host directory`);
                    }
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