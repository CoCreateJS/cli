const fs = require("fs");
const path = require("path");

/**
 * CLI-compatible function to enrich repository configurations with metadata 
 * (e.g. package.json details, dependency maps).
 * 
 * @param {Array<Object>} repos - List of repository configuration items.
 * @param {Array<Object>} failed - Reference list to register execution failures.
 * @param {string} [directory] - Optional parent directory to override path resolution.
 * @returns {Promise<Array<Object>>} Enriched repositories array.
 */
module.exports = async function addMeta(repos, failed, directory) {
    const cwd = process.cwd();

    for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];
        if (!repo) continue;

        const rawPath = repo.path || repo.absolutePath || repo.directory;
        if (!rawPath) {
            continue;
        }

        // Standard clean names resolution
        const pathBasedName = path.basename(rawPath);
        repo.name = repo.name || pathBasedName;
        repo.plainName = repo.name.startsWith("CoCreate-")
            ? repo.name.substring(9)
            : repo.name;

        // Always calculate and resolve absolute paths first, even if package.json doesn't exist yet!
        // This guarantees that commands like gitClone can run without crashing on undefined paths.
        let resolvedAbsolutePath = null;
        if (directory) {
            resolvedAbsolutePath = path.resolve(directory, rawPath);
        } else {
            resolvedAbsolutePath = path.resolve(cwd, rawPath);
        }

        repo.absolutePath = repo.absolutePath || resolvedAbsolutePath;
        repo.directory = repo.directory || path.dirname(resolvedAbsolutePath);

        // Check if package.json exists. If not, silently skip metadata extraction.
        const packageJsonPath = path.join(repo.absolutePath, "package.json");
        if (!fs.existsSync(packageJsonPath)) {
            continue;
        }

        let packageObj;
        try {
            packageObj = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        } catch (err) {
            // Only log and register real failures, such as corrupted JSON structure
            console.error(`[addMeta] Error reading/parsing package.json at ${packageJsonPath}:`, err.message);
            failed.push({
                name: repo.name,
                error: `[addMeta] failed to parse package.json: ${err.message}`
            });
            continue;
        }

        repo.packageName = packageObj.name;

        repo.deps = Object.keys(packageObj.dependencies || {})
            .filter((packageName) => packageName.startsWith("@cocreate/"));

        repo.devDeps = Object.keys(packageObj.devDependencies || {})
            .filter((packageName) => packageName.startsWith("@cocreate/"));
    }

    return repos;
};
