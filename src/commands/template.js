const fs = require("fs");
const path = require("path");
const { getConfig } = require("../getConfig");

const fsp = fs.promises;

function normalizePath(value) {
    if (!value) return "";
    return String(value).replace(/\\/g, "/");
}

function matchesPath(filename, pattern) {
    const relativePath = path.relative(pattern, filename);
    return relativePath === "" || (
        relativePath !== ".." &&
        !relativePath.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relativePath)
    );
}

function isExcluded(filename, patterns = []) {
    return patterns.some((pattern) => matchesPath(filename, pattern));
}

function isIncluded(filename, isDirectory, patterns = []) {
    if (!patterns.length) return true;
    return patterns.some((pattern) => {
        if (matchesPath(filename, pattern)) return true;
        return isDirectory && matchesPath(pattern, filename);
    });
}

function resolvePatterns(entryRoot, patterns = []) {
    return patterns.map((pattern) => path.resolve(entryRoot, pattern));
}

function isPathWithin(filename, root) {
    const relativePath = path.relative(root, filename);
    return relativePath === "" || (
        relativePath !== ".." &&
        !relativePath.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relativePath)
    );
}

async function copyRecursive(source, entryRoot, outputRoot, rule, options, stats) {
    const entries = await fsp.readdir(source, { withFileTypes: true });
    for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const relativePath = normalizePath(path.relative(entryRoot, sourcePath));
        const isDirectory = entry.isDirectory();

        if (isExcluded(sourcePath, rule.excludePaths)) {
            stats.skipped++;
            if (options.verbose) console.log(`Excluded: ${relativePath}`);
            continue;
        }
        if (!isIncluded(sourcePath, isDirectory, rule.includePaths)) {
            stats.skipped++;
            if (options.verbose) console.log(`Skipped: ${relativePath}`);
            continue;
        }
        if (entry.isSymbolicLink()) {
            stats.skipped++;
            if (options.verbose) console.log(`Skipped symlink: ${relativePath}`);
            continue;
        }

        const outputPath = path.join(outputRoot, relativePath);
        if (isDirectory) {
            await copyRecursive(sourcePath, entryRoot, outputRoot, rule, options, stats);
            continue;
        }
        if (!entry.isFile()) {
            stats.skipped++;
            continue;
        }

        stats.copied++;
        console.log(`${options.dryRun ? "Would copy" : "Copied"}: ${relativePath}`);
        if (!options.dryRun) {
            await fsp.mkdir(path.dirname(outputPath), { recursive: true });
            await fsp.copyFile(sourcePath, outputPath);
        }
    }
}

async function prepareRule(rule, index, configDirectory) {
    if (!rule || typeof rule !== "object") {
        throw new Error(`Template rule ${index + 1} must be an object`);
    }
    if (typeof rule.entry !== "string" || !rule.entry.trim()) {
        throw new Error(`Template rule ${index + 1} requires an entry path`);
    }
    if (typeof rule.output !== "string" || !rule.output.trim()) {
        throw new Error(`Template rule ${index + 1} requires an output path`);
    }
    for (const property of ["include", "exclude"]) {
        if (rule[property] !== undefined && !Array.isArray(rule[property])) {
            throw new Error(`Template rule ${index + 1} ${property} must be an array`);
        }
        if (rule[property]?.some((pattern) =>
            typeof pattern !== "string" || !pattern.trim()
        )) {
            throw new Error(
                `Template rule ${index + 1} ${property} paths must be non-empty strings`
            );
        }
    }

    const entryRoot = path.resolve(configDirectory, rule.entry);
    const outputRoot = path.resolve(configDirectory, rule.output);
    const entryStats = await fsp.stat(entryRoot).catch(() => null);
    if (!entryStats?.isDirectory()) {
        throw new Error(`Template entry directory does not exist: ${entryRoot}`);
    }
    if (matchesPath(outputRoot, entryRoot)) {
        throw new Error(`Template output cannot be inside its entry directory: ${outputRoot}`);
    }

    const resolvedRule = {
        includePaths: resolvePatterns(entryRoot, rule.include),
        excludePaths: resolvePatterns(entryRoot, rule.exclude)
    };
    return { entryRoot, outputRoot, resolvedRule };
}

async function processPreparedRule(preparedRule, options) {
    const stats = { copied: 0, skipped: 0 };
    await copyRecursive(
        preparedRule.entryRoot,
        preparedRule.entryRoot,
        preparedRule.outputRoot,
        preparedRule.resolvedRule,
        options,
        stats
    );
    return stats;
}

async function processRule(rule, index, configDirectory, options) {
    const preparedRule = await prepareRule(rule, index, configDirectory);
    return processPreparedRule(preparedRule, options);
}

async function cleanOutputDirectories(preparedRules, configDirectory, options) {
    const outputRoots = [...new Set(preparedRules.map(({ outputRoot }) => outputRoot))];
    const entryRoots = preparedRules.map(({ entryRoot }) => entryRoot);
    const configRoot = path.resolve(configDirectory);

    for (const outputRoot of outputRoots) {
        if (outputRoot === path.parse(outputRoot).root) {
            throw new Error(`Template output cannot be a filesystem root: ${outputRoot}`);
        }
        if (isPathWithin(configRoot, outputRoot)) {
            throw new Error(`Template output cannot contain the CoCreate.config.js directory: ${outputRoot}`);
        }
        if (entryRoots.some((entryRoot) =>
            isPathWithin(outputRoot, entryRoot) || isPathWithin(entryRoot, outputRoot)
        )) {
            throw new Error(`Template output cannot overlap a template entry directory: ${outputRoot}`);
        }
    }

    for (const outputRoot of outputRoots) {
        console.log(`${options.dryRun ? "Would clean" : "Cleaned"} template output: ${outputRoot}`);
        if (!options.dryRun) {
            await fsp.rm(outputRoot, { recursive: true, force: true });
        }
    }
}

module.exports = async function template(_repositories, args = []) {
    const options = {
        clean: args.includes("--clean"),
        dryRun: args.includes("--dry-run") || args.includes("-n"),
        verbose: args.includes("--verbose") || args.includes("-v")
    };
    const unsupported = args.filter((arg) =>
        !["--clean", "--dry-run", "-n", "--verbose", "-v"].includes(arg)
    );
    if (unsupported.length) {
        throw new Error(`Unknown template option: ${unsupported[0]}`);
    }

    const config = await getConfig(process.cwd());
    if (!config?.configPath) {
        throw new Error("CoCreate.config.js could not be found");
    }
    const rules = config.template;
    if (rules === undefined) return [];
    if (!Array.isArray(rules)) {
        throw new Error("CoCreate.config.js template must be an array");
    }
    if (!rules.length) return [];

    const configDirectory = path.dirname(config.configPath);
    const preparedRules = [];
    for (let index = 0; index < rules.length; index++) {
        preparedRules.push(await prepareRule(rules[index], index, configDirectory));
    }
    if (options.clean) {
        await cleanOutputDirectories(preparedRules, configDirectory, options);
    }

    const totals = { copied: 0, skipped: 0 };
    for (const preparedRule of preparedRules) {
        const stats = await processPreparedRule(preparedRule, options);
        totals.copied += stats.copied;
        totals.skipped += stats.skipped;
    }
    console.log(
        `Template complete: ${totals.copied} file(s) ${options.dryRun ? "selected" : "copied"}, ` +
        `${totals.skipped} item(s) skipped`
    );
    return [];
};

module.exports.normalizePath = normalizePath;
module.exports.isExcluded = isExcluded;
module.exports.isIncluded = isIncluded;
module.exports.resolvePatterns = resolvePatterns;
module.exports.processRule = processRule;
