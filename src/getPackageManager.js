const fs = require("fs");
const path = require("path");

/**
 * Detects the active package manager based strictly on workspace lockfiles,
 * distinguishing between Yarn Classic and Yarn Berry by analyzing yarn.lock directly.
 * 
 * @param {Object} [options]
 * @param {string} [options.cwd=process.cwd()] Directory containing the workspace lockfile.
 * @returns {Object} Normalized package-manager capabilities.
 */
function getPackageManager(options = {}) {
    const cwd = options.cwd || process.cwd();
    let details;

    // Bun lockfile checks
    if (fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock"))) {
        details = createDetails("bun", "bun", "node-modules", cwd);
    }
    
    // pnpm lockfile check
    if (!details && fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
        details = createDetails("pnpm", "pnpm", "node-modules", cwd);
    }

    // Yarn lockfile check
    const yarnLockPath = path.join(cwd, "yarn.lock");
    if (!details && fs.existsSync(yarnLockPath)) {
        let variant = "classic";
        try {
            const content = fs.readFileSync(yarnLockPath, "utf8");
            if (content.includes("__metadata:")) {
                variant = "berry";
            }
        } catch (e) {
            // Safe fallback to Classic if the lockfile cannot be read.
        }

        const linker = variant === "berry" ? getYarnBerryLinker(cwd) : "node-modules";
        details = createDetails(`yarn-${variant}`, "yarn", linker, cwd, variant);
    }

    // npm lockfile check
    if (!details && fs.existsSync(path.join(cwd, "package-lock.json"))) {
        details = createDetails("npm", "npm", "node-modules", cwd);
    }

    details ||= createDetails("npm", "npm", "node-modules", cwd);
    return details;
}

function createDetails(id, executable, linker, cwd, variant = null) {
    return {
        id,
        name: id.startsWith("yarn-") ? "yarn" : id,
        executable,
        variant,
        linker,
        usesNodeModules: linker !== "pnp",
        cwd
    };
}

function getYarnBerryLinker(cwd) {
    const yarnrcPath = path.join(cwd, ".yarnrc.yml");
    if (fs.existsSync(yarnrcPath)) {
        try {
            const content = fs.readFileSync(yarnrcPath, "utf8");
            const match = content.match(/^\s*nodeLinker\s*:\s*["']?([^\s"'#]+)["']?/m);
            if (match) return match[1] === "pnp" ? "pnp" : match[1];
        } catch (e) {
            // Yarn Berry defaults to PnP when its configuration cannot be read.
        }
    }

    if (
        fs.existsSync(path.join(cwd, ".pnp.cjs")) ||
        fs.existsSync(path.join(cwd, ".pnp.js"))
    ) {
        return "pnp";
    }

    return "pnp";
}

module.exports = getPackageManager;
