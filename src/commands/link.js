const spawn = require("../spawn");
const path = require("path");
const fs = require("fs");
const { color } = require("../fonts");

const isWindows = process.platform === "win32";

/**
 * Safely removes a directory or symlink, handling file locks and retry logic.
 */
async function safeRemove(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    // Check if it's a symlink first
    try {
        const stat = await fs.promises.lstat(dirPath);
        if (stat.isSymbolicLink()) {
            await fs.promises.unlink(dirPath);
            return;
        }
    } catch (e) {
        // Fall through to recursive removal if lstat fails
    }

    // Standard recursive removal with a short retry helper for file locks
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await fs.promises.rm(dirPath, { recursive: true, force: true });
            return;
        } catch (err) {
            if (attempt === 3) throw err;
            await new Promise((resolve) => setTimeout(resolve, 150 * attempt)); // Exponential backoff
        }
    }
}

/**
 * Safely creates a symlink. On Windows, uses 'junction' for directories
 * to bypass the requirement for administrator privileges.
 */
async function safeSymlink(target, linkPath) {
    // Ensure the parent directory of the link exists (critical for scoped packages like @myorg/pkg)
    await fs.promises.mkdir(path.dirname(linkPath), { recursive: true });

    // Clean up any existing file/directory/symlink at the destination
    await safeRemove(linkPath);

    // Use 'junction' on Windows for directories to avoid privilege errors
    const type = isWindows ? "junction" : "dir";
    await fs.promises.symlink(target, linkPath, type);
}

module.exports = async (repos, args) => {
    const failed = [];

    try {
        for (let repo of repos) {
            if (!repo) continue;
            if (repo.exclude && repo.exclude.includes("link")) continue;
            if (process.cwd() === repo.absolutePath) continue;

            if (repo.packageManager === "npm") {
                try {
                    // Resolve clean, absolute paths for target and symlink destination
                    const hostPackageLink = path.resolve(
                        process.cwd(),
                        "node_modules",
                        repo.packageName
                    );
                    const depPath = path.resolve(repo.absolutePath);

                    // Verify host node_modules exists before symlinking
                    const hostNodeModules = path.resolve(process.cwd(), "node_modules");
                    if (!fs.existsSync(hostNodeModules)) {
                        await fs.promises.mkdir(hostNodeModules, { recursive: true });
                    }

                    // Perform robust manual symlinking directly inside the host's node_modules
                    await safeSymlink(depPath, hostPackageLink);
                    
                    console.log(
                        color.green + 
                        `[npm] Linked: ${repo.packageName} -> ${repo.absolutePath}` + 
                        color.reset
                    );
                } catch (err) {
                    // Fallback to Native CLI "npm link <path>" if manual symlinking fails
                    console.warn(
                        color.yellow + 
                        `Manual symlink failed for ${repo.name}. Falling back to CLI 'npm link'...` + 
                        color.reset
                    );

                    let exitCode = await spawn("npm", ["link", repo.absolutePath], {
                        cwd: process.cwd(),
                        shell: true,
                        stdio: "inherit"
                    });

                    if (exitCode !== 0) {
                        failed.push({
                            name: repo.name,
                            error: `npm link failed with exit code ${exitCode}: ${err.message}`
                        });
                        console.error(
                            color.red +
                            `${repo.name}: npm link failed` +
                            color.reset
                        );
                    }
                }
            } else {
                // Yarn standard behavior (works well on macOS/Linux/Windows)
                let exitCode = await spawn(repo.packageManager, ["link"], {
                    cwd: repo.absolutePath,
                    shell: true,
                    stdio: "inherit"
                });

                if (exitCode !== 0) {
                    failed.push({
                        name: repo.name,
                        error: `${repo.packageManager} link failed`
                    });
                    console.error(
                        color.red +
                        `${repo.name}: ${repo.packageManager} link failed` +
                        color.reset
                    );
                } else {
                    console.log(repo.packageManager, "link", repo.packageName);

                    let exitCodeLink = await spawn(
                        repo.packageManager,
                        ["link", repo.packageName],
                        {
                            cwd: process.cwd(),
                            shell: true,
                            stdio: "inherit"
                        }
                    );
                    if (exitCodeLink !== 0) {
                        failed.push({
                            name: repo.name,
                            error: `${repo.packageManager} link ${repo.packageName} failed`
                        });
                        console.error(
                            color.red +
                            `${repo.name}: ${repo.packageManager} link ${repo.packageName} failed` +
                            color.reset
                        );
                    }
                }
            }
        }
    } catch (err) {
        failed.push({ name: "GENERAL", error: err.message });
        console.error(color.red + `${err}` + color.reset);
    }

    return failed;
};