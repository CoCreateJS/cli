const os = require("os");

/**
 * Detects the active operating system and provides helpful boolean flags
 * and platform metadata.
 * 
 * @returns {{ platform: string, isWindows: boolean, isMac: boolean, isLinux: boolean, type: string, release: string }}
 */
function getOS() {
    const platform = process.platform;

    return {
        platform,
        isWindows: platform === "win32",
        isMac: platform === "darwin",
        isLinux: platform === "linux",
        type: os.type(),     // 'Windows_NT', 'Darwin', 'Linux'
        release: os.release() // OS release version string
    };
}

module.exports = getOS;