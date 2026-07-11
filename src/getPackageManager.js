const fs = require("fs");
const path = require("path");

/**
 * Detects the active package manager based strictly on workspace lockfiles,
 * distinguishing between Yarn Classic and Yarn Berry by analyzing yarn.lock directly.
 * 
 * @returns {"bun"|"pnpm"|"yarn-berry"|"yarn-classic"|"npm"}
 */
function getPackageManager() {
    const cwd = process.cwd();

    // Bun lockfile checks
    if (fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock"))) {
        return "bun";
    }
    
    // pnpm lockfile check
    if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
        return "pnpm";
    }

    // Yarn lockfile check
    const yarnLockPath = path.join(cwd, "yarn.lock");
    if (fs.existsSync(yarnLockPath)) {
        try {
            const content = fs.readFileSync(yarnLockPath, "utf8");
            // Yarn Berry lockfiles contain a "__metadata:" block at the top
            if (content.includes("__metadata:")) {
                return "yarn-berry";
            }
        } catch (e) {
            // Safe fallback to classic if the file cannot be read
        }
        return "yarn-classic";
    }

    // npm lockfile check
    if (fs.existsSync(path.join(cwd, "package-lock.json"))) {
        return "npm";
    }

    return "npm"; // Default fallback
}

module.exports = getPackageManager;