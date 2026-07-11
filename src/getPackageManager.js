const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Detects the active package manager based on workspace lockfiles,
 * and distinguishes between Yarn Classic and Yarn Berry.
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

    // Yarn lockfile checks
    if (fs.existsSync(path.join(cwd, "yarn.lock"))) {
        // If .yarnrc.yml exists, it's definitely Yarn Berry (v2-v4)
        if (fs.existsSync(path.join(cwd, ".yarnrc.yml"))) {
            return "yarn-berry";
        }
        
        // Active fallback check by running yarn --version
        try {
            const version = execSync("yarn --version", { encoding: "utf8" }).trim();
            if (!version.startsWith("1.")) {
                return "yarn-berry";
            }
        } catch (e) {
            // If the command fails, safely assume Classic (v1)
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