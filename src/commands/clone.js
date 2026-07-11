const spawn = require("../spawn");
const path = require("path");
const fs = require("fs");

/**
 * CLI-compatible clone command that resolves paths dynamically,
 * clones missing repositories, and silently skips already cloned ones.
 */
module.exports = async function gitClone(repos, args) {
    const failed = [];
    const cwdPath = path.resolve(process.cwd());

    for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];
        if (!repo) continue;

        const rawPath = repo.path || repo.absolutePath || repo.directory;
        if (!rawPath) {
            failed.push({ 
                name: repo.name || `Repo #${i}`, 
                error: "No path property defined in the configuration" 
            });
            continue;
        }

        repo.absolutePath = repo.absolutePath || path.resolve(cwdPath, rawPath);
        repo.directory = repo.directory || path.dirname(repo.absolutePath);
        repo.name = repo.name || path.basename(repo.absolutePath);

        if (cwdPath === repo.absolutePath) {
            continue;
        }

        const relativeRepoPath = path.relative(cwdPath, repo.absolutePath);

        // Clean skip logging using path
        if (fs.existsSync(repo.absolutePath)) {
            console.log(`Already exists: ${relativeRepoPath} (Skipped)`);
            continue;
        }

        if (!fs.existsSync(repo.directory)) {
            try {
                fs.mkdirSync(repo.directory, { recursive: true });
            } catch (err) {
                failed.push({ 
                    name: repo.name, 
                    error: `Failed to create directory ${repo.directory}: ${err.message}` 
                });
                continue;
            }
        }

        if (!repo.repo) {
            failed.push({ 
                name: repo.name, 
                error: "No git repository URL provided in config" 
            });
            continue;
        }

        let gitUrl = repo.repo;
        if (!gitUrl.startsWith("http://") && !gitUrl.startsWith("https://")) {
            gitUrl = "https://" + gitUrl;
        }

        // Clean success logging after process completes successfully
        let exitCode = await spawn("git", ["clone", gitUrl], {
            stdio: "inherit",
            cwd: repo.directory
        });

        if (exitCode !== 0) {
            failed.push({ name: repo.name, error: `cloning failed` });
        } else {
            console.log(`Successfully cloned: ${relativeRepoPath}`);
        }
    }

    return failed;
};