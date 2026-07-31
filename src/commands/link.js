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
 * @param {string} targetDir - Base directory to check for package manager configuration.
 * @param {string} packageManager - The active package manager name (npm, pnpm, yarn-classic, yarn-berry, bun).
 * @returns {string} Fully resolved path to the node_modules folder.
 */
function getTargetNodeModulesPath(targetDir, packageManager) {
    // Check .npmrc config if utilizing npm or pnpm
    if (packageManager === "npm" || packageManager === "pnpm") {
        const npmrcPath = path.join(targetDir, ".npmrc");
        if (fs.existsSync(npmrcPath)) {
            try {
                const content = fs.readFileSync(npmrcPath, "utf-8");
                const match = content.match(/^\s*modules-dir\s*=\s*["']?([^"'\r\n#;]+)["']?/m);
                if (match && match[1]) {
                    return path.resolve(targetDir, match[1].trim());
                }
            } catch (e) {
                // Gracefully ignore reading errors
            }
        }
    }

    // Check .yarnrc config if utilizing Yarn (Classic or Berry configured for custom folders)
    if (packageManager === "yarn-classic" || packageManager === "yarn-berry") {
        const yarnrcPath = path.join(targetDir, ".yarnrc");
        if (fs.existsSync(yarnrcPath)) {
            try {
                const content = fs.readFileSync(yarnrcPath, "utf-8");
                const match = content.match(/^\s*--(?:install\.)?modules-folder\s+["']?([^"'\r\n#]+)["']?/m);
                if (match && match[1]) {
                    return path.resolve(targetDir, match[1].trim());
                }
            } catch (e) {
                // Gracefully ignore reading errors
            }
        }
    }

    // Fallback to default
    return path.resolve(targetDir, "node_modules");
}

/**
 * Builds a fast lookup dictionary mapping package names (e.g. "@cocreate/utils")
 * to their absolute local filesystem paths.
 * 
 * @param {Array<Object>} repos - Array of repository configurations.
 * @param {string} cwd - Active working directory.
 * @returns {Map<string, Object>} Map of package names to repo objects.
 */
function buildWorkspaceMap(repos, cwd) {
    const map = new Map();

    for (const repo of repos) {
        if (!repo) continue;
        const rawPath = repo.path || repo.absolutePath || repo.directory;
        if (!rawPath) continue;

        const absolutePath = repo.absolutePath || path.resolve(cwd, rawPath);
        if (!fs.existsSync(absolutePath)) continue;

        let packageName = repo.packageName;
        const packageJsonPath = path.join(absolutePath, "package.json");

        if (fs.existsSync(packageJsonPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
                packageName = pkg.name || packageName;
            } catch (e) {
                // Ignore parse errors
            }
        }

        packageName = packageName || path.basename(absolutePath);

        const repoMeta = {
            ...repo,
            packageName,
            absolutePath,
            directory: path.dirname(absolutePath),
            name: repo.name || path.basename(absolutePath)
        };

        map.set(packageName, repoMeta);
    }

    return map;
}

/**
 * Reads a directory's package.json and extracts all declared dependencies
 * (dependencies, devDependencies, and peerDependencies).
 * 
 * @param {string} repoPath - Absolute path to package repository.
 * @returns {Array<string>} List of declared dependency names.
 */
function getPackageDependencies(repoPath) {
    const packageJsonPath = path.join(repoPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) return [];

    try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        const deps = new Set([
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.devDependencies || {}),
            ...Object.keys(pkg.peerDependencies || {})
        ]);
        return Array.from(deps);
    } catch (e) {
        return [];
    }
}

/**
 * Recursively links a local repository and its local sibling dependencies.
 * 
 * @param {Object} repo - Target repository object.
 * @param {Map<string, Object>} workspaceMap - Available local workspace repos.
 * @param {Object} options - Command options (useSymlink, packageManager, binName, failed, linkedPairs, depth).
 * @param {Set<string>} visited - Track visited packages to prevent circular loops.
 */
async function linkRepoAndDependencies(repo, workspaceMap, options, visited = new Set()) {
    const { useSymlink, packageManager, binName, failed, linkedPairs, stats, depth = 1 } = options;

    // Circular dependency prevention guard
    if (visited.has(repo.absolutePath)) {
        return;
    }
    visited.add(repo.absolutePath);

    const declaredDeps = getPackageDependencies(repo.absolutePath);
    const localDepsToLink = [];

    // Identify which declared dependencies exist in local workspace
    for (const depName of declaredDeps) {
        if (workspaceMap.has(depName)) {
            const depRepo = workspaceMap.get(depName);
            // Avoid self-linking
            if (depRepo.absolutePath !== repo.absolutePath) {
                localDepsToLink.push(depRepo);
            }
        }
    }

    if (localDepsToLink.length === 0) {
        return;
    }

    const targetNodeModules = getTargetNodeModulesPath(repo.absolutePath, packageManager);
    const indent = "  ".repeat(depth);

    for (let i = 0; i < localDepsToLink.length; i++) {
        const depRepo = localDepsToLink[i];
        const pairKey = `${repo.packageName}->${depRepo.packageName}`;

        // Skip re-linking identical pairs to avoid redundant I/O and console clutter
        if (linkedPairs.has(pairKey)) {
            continue;
        }
        linkedPairs.add(pairKey);

        const isLast = i === localDepsToLink.length - 1;
        const branchChar = isLast ? "└─" : "├─";

        try {
            if (useSymlink) {
                // Direct Symlink Mode
                const linkDestination = path.join(targetNodeModules, depRepo.packageName);
                const sourcePath = path.resolve(depRepo.absolutePath);

                await fs.promises.mkdir(path.dirname(linkDestination), { recursive: true });

                try {
                    const stat = await fs.promises.lstat(linkDestination);
                    if (stat.isSymbolicLink() || stat.isFile()) {
                        await fs.promises.unlink(linkDestination);
                    } else {
                        await fs.promises.rm(linkDestination, { recursive: true, force: true });
                    }
                } catch (e) {
                    // Path does not exist yet
                }

                const type = isWindows ? "junction" : "dir";
                await fs.promises.symlink(sourcePath, linkDestination, type);

                console.log(`${indent}${branchChar} 🔗 ${depRepo.packageName}`);
                stats.totalSymlinks++;
            } else {
                // Package Manager CLI Link Mode
                if (packageManager === "pnpm" || packageManager === "yarn-berry") {
                    let linkCode = await spawn(binName, ["link", depRepo.absolutePath], {
                        cwd: repo.absolutePath,
                        shell: true,
                        stdio: "pipe"
                    });
                    if (linkCode !== 0) throw new Error(`Link execution failed`);
                } else {
                    // 2-Step linking for npm / Yarn Classic / Bun
                    let regCode = await spawn(binName, ["link"], {
                        cwd: depRepo.absolutePath,
                        shell: true,
                        stdio: "pipe"
                    });
                    if (regCode !== 0) throw new Error(`Global registration failed`);

                    let linkCode = await spawn(binName, ["link", depRepo.packageName], {
                        cwd: repo.absolutePath,
                        shell: true,
                        stdio: "pipe"
                    });
                    if (linkCode !== 0) throw new Error(`Link command failed`);
                }
                console.log(`${indent}${branchChar} 🔗 ${depRepo.packageName}`);
                stats.totalSymlinks++;
            }

            // Recurse down the dependency tree for the nested dependency
            await linkRepoAndDependencies(depRepo, workspaceMap, {
                ...options,
                depth: depth + 1
            }, visited);

        } catch (err) {
            failed.push({
                name: `${repo.packageName} -> ${depRepo.packageName}`,
                error: err.message
            });
            console.error(`${indent}${branchChar} ❌ ${depRepo.packageName} (${err.message})`);
        }
    }
}

/**
 * CLI-compatible link command that establishes local connections using 
 * direct symlinking (fast mode) or the host system's package manager,
 * recursively traversing and linking local dependencies tree-wide.
 * 
 * @param {Array<Object>} repos - Array of repository configurations.
 * @param {Array<string>} args - Process arguments passed to the CLI command.
 * @returns {Promise<Array<Object>>} List of packages that encountered real errors.
 */
module.exports = async (repos, args) => {
    const startTime = Date.now();
    const failed = [];
    const packageManager = getPackageManager();
    const cwd = process.cwd();

    // Convert generic internal yarn manager labels to standard executable binary name
    const binName = (packageManager === "yarn-classic" || packageManager === "yarn-berry") 
        ? "yarn" 
        : packageManager;

    const useSymlink = args && args.includes("--symlink");

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

    console.log(`\n==================================================`);
    console.log(` Active Package Manager: ${packageManager.toUpperCase()}`);
    console.log(` Linking Strategy:       ${useSymlink ? "Direct Symlink (Fast)" : "Package Manager CLI"}`);
    console.log(`==================================================\n`);

    const workspaceMap = buildWorkspaceMap(repos, cwd);
    const linkedPairs = new Set();
    const stats = { primaryPackages: 0, totalSymlinks: 0 };

    const filterableRepos = repos.filter(r => r && (!r.exclude || !r.exclude.includes("link")));
    let currentIdx = 0;

    for (let repo of repos) {
        if (!repo) continue;
        if (repo.exclude && repo.exclude.includes("link")) continue;

        const rawPath = repo.path || repo.absolutePath || repo.directory;
        if (!rawPath) continue;

        const absolutePath = repo.absolutePath || path.resolve(cwd, rawPath);

        // Do not process current execution folder directly inside root loop
        if (cwd === absolutePath) continue;

        if (!fs.existsSync(absolutePath)) {
            console.log(`Skipped (not found): ${path.relative(cwd, absolutePath)}`);
            continue;
        }

        currentIdx++;
        const repoMeta = workspaceMap.get(repo.packageName) || {
            ...repo,
            absolutePath,
            packageName: repo.packageName || path.basename(absolutePath)
        };

        stats.primaryPackages++;
        console.log(`[${currentIdx}/${filterableRepos.length}] 📦 ${repoMeta.packageName}`);

        // Perform top-level link into current workspace root
        try {
            const rootNodeModules = getTargetNodeModulesPath(cwd, packageManager);
            if (useSymlink) {
                const linkDestination = path.join(rootNodeModules, repoMeta.packageName);
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
                await fs.promises.symlink(repoMeta.absolutePath, linkDestination, type);
                stats.totalSymlinks++;
            } else {
                if (packageManager === "pnpm" || packageManager === "yarn-berry") {
                    let linkCode = await spawn(binName, ["link", repoMeta.absolutePath], {
                        cwd,
                        shell: true,
                        stdio: "pipe"
                    });
                    if (linkCode !== 0) throw new Error("Execution failed");
                } else {
                    let regCode = await spawn(binName, ["link"], {
                        cwd: repoMeta.absolutePath,
                        shell: true,
                        stdio: "pipe"
                    });
                    if (regCode !== 0) throw new Error("Global registration failed");

                    let linkCode = await spawn(binName, ["link", repoMeta.packageName], {
                        cwd,
                        shell: true,
                        stdio: "pipe"
                    });
                    if (linkCode !== 0) throw new Error("Host linkage failed");
                }
                stats.totalSymlinks++;
            }
        } catch (err) {
            failed.push({
                name: repoMeta.packageName,
                error: err.message
            });
            console.error(`  ❌ Failed primary link: ${repoMeta.packageName} (${err.message})`);
        }

        const visited = new Set();
        await linkRepoAndDependencies(repoMeta, workspaceMap, {
            useSymlink,
            packageManager,
            binName,
            failed,
            linkedPairs,
            stats,
            depth: 1
        }, visited);
    }

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n--------------------------------------------------`);
    console.log(`✨ Linking Complete!`);
    console.log(`   Primary Packages Processed: ${stats.primaryPackages}`);
    console.log(`   Total Connections Linked:   ${stats.totalSymlinks}`);
    console.log(`   Errors Encountered:         ${failed.length}`);
    console.log(`   Time Elapsed:               ${durationSec}s`);
    console.log(`--------------------------------------------------\n`);

    return failed;
};