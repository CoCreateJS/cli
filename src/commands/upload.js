let fileModule = require("@cocreate/file");
// Safely resolve default export if it's wrapped as an ESM module
const file = fileModule && fileModule.default ? fileModule.default : fileModule;

// Required to watch more files than the default limit on Linux systems. You may need to run these commands in your terminal:
// echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
// echo "fs.inotify.max_user_instances=1024" | sudo tee -a /etc/sysctl.conf
// sudo sysctl -p
const path = require("path");
const fs = require("fs");
const { getConfig } = require("../getConfig");
const translate = require("./other/translate");

module.exports = async function upload(directory, args) {
    if (args && !Array.isArray(args)) args = [args];

    let isWatch = false;
    let translateFn = null;

    if (args && (args.includes("-t") || args.includes("--translate"))) {
        translateFn = translate;
        args = args.filter((arg) => arg !== "-t" && arg !== "--translate");
    }

    if (directory && typeof directory === "string") {
        if (["-w", "--watch"].includes(directory)) {
            isWatch = true;
        }
    }

    directory = process.cwd();

    if (
        isWatch ||
        (args && (args.includes("-w") || args.includes("--watch")))
    ) {
        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith("-")) continue;
            else if (path.isAbsolute(args[i])) directory = args[i];
            else directory = path.resolve(directory, args[i]);
        }

        console.log("Watching: ", directory);
        
        // Initialize Map to store timers for debouncing rapid duplicate events
        const debounceTimers = new Map();

        fs.watch(
            directory,
            { recursive: true },
            (eventType, filename) => {
                // Guard against null filenames and ignore config changes
                if (!filename || filename.includes("CoCreate.config.js")) return;

                // Clear any existing timer for this file
                if (debounceTimers.has(filename)) {
                    clearTimeout(debounceTimers.get(filename));
                }

                // Set a new timer to debounce the event
                const timer = setTimeout(async () => {
                    // Remove the timer from the map once it executes
                    debounceTimers.delete(filename);

                    // 1. Only check file existence if the OS flagged a 'rename'
                    // This handles creates, moves, and deletions properly.
                    if (eventType === 'rename') {
                        const fullPath = path.resolve(directory, filename);
                        if (!fs.existsSync(fullPath)) {
                            // console.log(`File deleted, renamed or relocated: ${filename}`);
                            // TODO: Add file deletion/removal logic here in the future.
                            return;
                        }
                    }

                    // 2. Process the valid, updated file
                    const config = await getConfig(directory, filename);
                    if (config.configPath) {
                        await file(config, config.configPath, config.filePath, {
                            watch: true,
                            translate: translateFn
                        });
                    } else {
                        console.log(
                            "Failed to read or parse CoCreate.config.js."
                        );
                    }
                }, 100); // 100ms debounce window

                // Store the timer
                debounceTimers.set(filename, timer);
            }
        );
    } else {
        if (!args || !args.length) {
            const CoCreateConfig = await getConfig(directory);
            if (CoCreateConfig.configPath) {
                await file(
                    CoCreateConfig,
                    CoCreateConfig.configPath,
                    CoCreateConfig.filePath,
                    { translate: translateFn }
                );
            } else {
                console.log("Failed to read or parse CoCreate.config.js.");
            }
        } else {
            for (let arg of args) {
                arg = path.resolve(directory, arg);
                let CoCreateConfig;

                try {
                    CoCreateConfig = JSON.parse(arg);
                } catch (error) {}

                if (!CoCreateConfig) {
                    CoCreateConfig = await getConfig(arg);
                    if (CoCreateConfig.configPath) {
                        await file(
                            CoCreateConfig,
                            CoCreateConfig.configPath,
                            CoCreateConfig.filePath,
                            { translate: translateFn }
                        );
                    } else {
                        console.log(
                            "Failed to read or parse CoCreate.config.js."
                        );
                    }
                }
            }
        }
    }
};