const path = require("path");
const fs = require("fs");

/**
 * Updates .gitignore files across multiple repositories with descriptive path logging.
 */
module.exports = async function updateGitignore(repos, args) {
    const failed = [];
    const cwd = process.cwd();
    const templatePath = path.join(cwd, ".gitignore");

    if (!fs.existsSync(templatePath)) {
        throw new Error(`No .gitignore template found in: ${cwd}`);
    }

    let templateContent;
    try {
        templateContent = fs.readFileSync(templatePath, "utf8");
    } catch (error) {
        throw new Error(`Failed to read the template file: ${error.message}`);
    }

    for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];
        if (!repo) continue;
        
        try {
            const rawPath = repo.absolutePath || repo.directory || repo.path;
            if (!rawPath) continue;

            const resolvedPath = path.resolve(cwd, rawPath);

            if (!fs.existsSync(resolvedPath)) continue;
            if (path.resolve(resolvedPath) === path.resolve(cwd)) continue;

            const gitignorePath = path.join(resolvedPath, ".gitignore");

            if (fs.existsSync(gitignorePath)) {
                fs.unlinkSync(gitignorePath);
            }

            fs.writeFileSync(gitignorePath, templateContent, "utf8");
            
            // Log the clean relative path from where the command was executed
            const relativeLogPath = path.relative(cwd, gitignorePath);
            console.log(`Successfully updated: ${relativeLogPath}`);

        } catch (error) {
            failed.push({ 
                name: repo.name || `Repo #${i}`, 
                error: error.message 
            });
        }
    }

    return failed;
};