const spawn = require("../spawn");
const path = require("path");
const fs = require("fs");
const getPackageManager = require("../getPackageManager");
const getOS = require("../getOS");

const { isWindows } = getOS();

/**
 * Resolves the configured target node_modules directory path.
 * Targeted check: parses RC files only associated with the active package manager.
 * 
 * @param {string} packageManager - The active package manager name (npm, pnpm, yarn-classic, yarn-berry, bun).
 * @returns {string} Fully resolved path to the node_modules folder.
 */
function getTargetNodeModulesPath(packageManager) {
    const cwd = process.cwd();

    // Check .npmrc config if utilizing npm or pnpm
    if (packageManager === "npm" || packageManager === "pnpm") {
        const npmrcPath = path.join(cwd, ".npmrc");
        if (fs.existsSync(npmrcPath)) {
            try {
                const content = fs.readFileSync(npmrcPath, "utf-8");
                const match = content.match(/^\s*modules-dir\s*=\s*["']?([^"'\r\n#;]+)["']?/m);
                if (match && match[1]) {
                    return path.resolve(cwd, match[1].trim());
                }
            } catch (e) {
                // Gracefully ignore reading errors
            }
        }
    }

    // Check .yarnrc config if utilizing Yarn (Classic or Berry configured for custom folders)
    if (packageManager === "yarn-classic" || packageManager === "yarn-berry") {
        const yarnrcPath = path.join(cwd, ".yarnrc");
        if (fs.existsSync(yarnrcPath)) {
            try {
                const content = fs.readFileSync(yarnrcPath, "utf-8");
                const match = content.match(/^\s*--(?:install\.)?modules-folder\s+["']?([^"'\r\n#]+)["']?/m);
                if (match && match[1]) {
                    return path.resolve(cwd, match[1].trim());
                }
            } catch (e) {
                // Gracefully ignore reading errors
            }
        }
    }

    // Fallback to default
    return path.resolve(cwd, "node_modules");
}

/**
 * CLI-compatible link command that establishes local connections using 
 * direct symlinking (fast mode) or the host system's package manager.
 * 
 * @param {Array<Object>} repos - Array of repository configurations.
 * @param {Array<string>} args - Process arguments passed to the CLI command.
 * @returns {Promise<Array<Object>>} List of packages that encountered real errors.
 */
module.exports = async (repos, args) => {
    const failed = [];
    const packageManager = getPackageManager();
    const cwd = process.cwd();
    
    // Convert generic internal yarn manager labels to the standard system execution binary name
    const binName = (packageManager === "yarn-classic" || packageManager === "yarn-berry") 
        ? "yarn" 
        : packageManager;
    
    const useSymlink = args && args.includes("--symlink");
    let targetNodeModules = null;

    // --- PLUG'N'PLAY DETECTION & SHORT-CIRCUIT ---
    const isPnp = packageManager === "yarn-berry" && (
        fs.existsSync(path.join(cwd, ".pnp.cjs")) || 
        fs.existsSync(path.join(cwd, ".pnp.js"))
    );

    if (isPnp) {
        console.log(`Active Package Manager: ${packageManager.toUpperCase()} (Plug'n'Play Active)`);
        console.log("No linking required (automatic mapping handled natively by the package manager).");
        return failed;
    }

    console.log(`Active Package Manager: ${packageManager.toUpperCase()}`);

    if (useSymlink) {
        targetNodeModules = getTargetNodeModulesPath(packageManager);
        const relativeTargetDir = path.relative(cwd, targetNodeModules) || "node_modules";
        
        console.log(`[Symlink Mode] Target: ${relativeTargetDir}\n`);

        if (!fs.existsSync(targetNodeModules)) {
            await fs.promises.mkdir(targetNodeModules, { recursive: true });
        }
    } else {
        console.log(""); 
    }

    for (let repo of repos) {
        if (!repo) continue;
        if (repo.exclude && repo.exclude.includes("link")) continue;

        const rawPath = repo.path || repo.absolutePath || repo.directory;
        if (!rawPath) continue;

        // Resolve local path values relative to the active command execution folder
        repo.absolutePath = repo.absolutePath || path.resolve(cwd, rawPath);
        repo.directory = repo.directory || path.dirname(repo.absolutePath);
        repo.name = repo.name || path.basename(repo.absolutePath);

        // Do not process current execution folder inside linking commands
        if (cwd === repo.absolutePath) continue;

        const relativeRepoPath = path.relative(cwd, repo.absolutePath);

        // Verify package directory exists on local disk
        if (!fs.existsSync(repo.absolutePath)) {
            console.log(`Skipped (not found): ${relativeRepoPath}`);
            continue;
        }

        // Dynamically resolve package name from local package.json if it is missing
        if (!repo.packageName) {
            const packageJsonPath = path.join(repo.absolutePath, "package.json");
            if (fs.existsSync(packageJsonPath)) {
                try {
                    const packageObj = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
                    repo.packageName = packageObj.name;
                } catch (e) {
                    // Ignore reading errors
                }
            }
            repo.packageName = repo.packageName || repo.name;
        }

        try {
            if (useSymlink) {
                const linkDestination = path.join(targetNodeModules, repo.packageName);
                const sourcePath = path.resolve(repo.absolutePath);

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

                console.log(`Successfully symlinked: ${relativeRepoPath} -> node_modules/${repo.packageName}`);
            } else {
                
                // --- 1-STEP DIRECT PATH LINKING (pnpm & Yarn Berry) ---
                if (packageManager === "pnpm" || packageManager === "yarn-berry") {
                    console.log(`Linking: ${repo.packageName}...`);

                    let linkCode = await spawn(binName, ["link", repo.absolutePath], {
                        cwd: cwd,
                        shell: true,
                        stdio: "inherit"
                    });

                    if (linkCode !== 0) {
                        throw new Error(`Execution failed`);
                    }
                    
                } else {
                    // --- 2-STEP GLOBAL REGISTRY LINKING (npm, Yarn Classic, Bun) ---
                    console.log(`Registering: ${repo.packageName}...`);
                    
                    let regCode = await spawn(binName, ["link"], {
                        cwd: repo.absolutePath,
                        shell: true,
                        stdio: "inherit"
                    });

                    if (regCode !== 0) {
                        throw new Error(`Global registration failed`);
                    }

                    console.log(`Linking: ${repo.packageName}...`);

                    let linkCode = await spawn(binName, ["link", repo.packageName], {
                        cwd: cwd,
                        shell: true,
                        stdio: "inherit"
                    });

                    if (linkCode !== 0) {
                        throw new Error(`Host linkage failed`);
                    }
                }
                
                console.log(`Successfully linked: ${repo.packageName}`);
                console.log(""); 
            }

        } catch (err) {
            // Log failure message and append package metadata for downstream retrying steps
            failed.push({
                name: repo.name || repo.packageName,
                error: err.message
            });
            console.error(`Failed to link: ${repo.name || repo.packageName} (${err.message})`);
        }
    }

    return failed;
};