const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

/**
 * Dynamically loads and returns the configuration file.
 * Handles:
 * - CommonJS (module.exports = { ... })
 * - ESM Default Export (export default { ... })
 * - ESM Named Export Object (export const config = { ... })
 * - ESM Individual Named Exports (export const repositories = [...])
 * 
 * @param {string} directory - The starting directory to search from.
 * @param {string} filename - The target filename to append to the config filepath.
 * @returns {Promise<Object|null>} The parsed config object, or null if not found.
 */
async function getConfig(directory, filename = "") {
    let configPath = findClosestConfig(directory, "CoCreate.config.js");
    if (configPath) {
        try {
            // Convert path to file:// URL to make dynamic imports bulletproof across OS environments (especially Windows)
            const configUrl = pathToFileURL(configPath).href;
            
            // Dynamically import the module
            const modulePayload = await import(configUrl);
            
            let rawConfig;
            
            if (modulePayload.default !== undefined) {
                // 1. Handles 'export default { ... }' or 'module.exports = { ... }'
                rawConfig = modulePayload.default;
            } else if (modulePayload.config !== undefined && typeof modulePayload.config === 'object') {
                // 2. Handles 'export const config = { ... }' or 'exports.config = { ... }'
                rawConfig = modulePayload.config;
            } else {
                // 3. Handles individual exports like 'export const repositories = [...]'
                rawConfig = modulePayload;
            }
            
            // Dynamic imports return read-only namespace objects;
            // shallow cloning allows us to safely append configPath and filePath.
            let config = {};
            if (rawConfig && typeof rawConfig === 'object') {
                config = { ...rawConfig };
            } else {
                config = rawConfig;
            }

            config.configPath = configPath;
            config.filePath = path.resolve(directory, filename);
            return config;
        } catch (error) {
            console.error(`Error loading configuration at ${configPath}:`, error);
            throw error;
        }
    } else {
        console.log("No CoCreate.config file found in parent directories.");
        return null;
    }
}

/**
 * Climbs up the directory tree to find the closest target configuration file.
 * Safely handles file system root termination to avoid infinite loops.
 * 
 * @param {string} directory - Starting directory path.
 * @param {string} filename - Target file to locate.
 * @returns {string|null} Resolved absolute path to the file, or null if not found.
 */
function findClosestConfig(directory, filename) {
    let currentDir = path.resolve(directory);

    while (true) {
        let configFile = path.join(currentDir, filename);

        if (fs.existsSync(configFile)) {
            return configFile;
        }

        let parentDir = path.dirname(currentDir);
        
        // Safety Break: Stop climbing if we've reached the system root (e.g. '/' on Linux/Mac, 'C:\' on Windows)
        if (parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }

    return null;
}

module.exports = { getConfig, findClosestConfig };