module.exports = {
	// Organization and API credentials
	organization_id: "YOUR_ORGANIZATION_ID",
	key: "YOUR_API_KEY",

	// WebSocket host configuration for different branches
	// Update the domain name to your server domain
	host: {
		$branch: {
			master: "wss://YOUR_DOMAIN.com",
			dev: "wss://dev.YOUR_DOMAIN.com",
			test: "wss://test.YOUR_DOMAIN.com"
		}
	},

	// Filesystem rules used by `coc template` to build a reusable project template
	// Paths are resolved relative to this CoCreate.config.js file.
	template: [
		// {
		// 	entry: "./",
		// 	output: "../CoCreate-app-template",
		// 	exclude: ["./src/admin/", "./src/account/", "./src/apps/", "./src/config/", "./node_modules/", "./.git/"]
		// },
		// {
		// 	entry: "./",
		// 	output: "../CoCreate-app-template",
		// 	include: ["./src/admin/", "./src/account/", "./src/apps/"]
		// }
	],

	// Sources allows you to inject file contents into objects on the server
	// Example: map file contents to specific keys
	// Useful for embedding demo files, templates, etc.
	sources: [
		// {
		// 	array: "demos",
		// 	object: {
		// 		_id: "unique_id",
		// 		"demo-name": "{{./path/to/demo/file.html}}"
		// 	}
		// }
	],

	// Modules configuration for lazy loading and bundling
	// Define which modules are lazy loaded vs always included
	// Leave empty if modules are loaded from individual package.json files
	modules: {
		// outputPath: "./CoCreate.modules.js",
		// "module-name": {
		// 	import: "@cocreate/module-name",
		// 	selector: "[attribute-selector]"
		// }
	},

	// Plugin whitelist - add any plugins you use in your application
	// Just whitelisting them here enables dynamic plugin loading from HTML
	plugins: {
		// Common plugins - add more as needed
		Toastify: {
			js: [{ src: "https://cdn.jsdelivr.net/npm/toastify-js", crossOrigin: "anonymous" }],
			css: ["https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"]
		},
		// Add other plugins here following the same structure
		// Each plugin can have 'js' and 'css' arrays with CDN links
	},

	// Repositories for polyrepo management
	// Each entry is a local repository that coc commands can operate on
	// When you run "coc <command>", it executes that command on all listed repositories
	// Example: "coc git status" runs "git status" on each repo (except those where "git" is excluded)
	repositories: [
		{
			// Relative path to the repository
			path: "./CoCreateJS",
			
			// Git repository URL
			repo: "github.com/CoCreateJS/CoCreateJS.git",
			
			// Optional: exclude command types from running on this repository
			// These are COMMAND TYPES to exclude, not file patterns
			// Examples: "git", "npm", "link", "install", "clone"
			// Use "git" to prevent git commands from running on this repo
			// Use "link" to prevent npm link from running during "coc install"
			exclude: ["git"]
		}
		// Add more repositories as needed for polyrepo management
		// {
		// 	path: "./CoCreate-modules/CoCreate-cli",
		// 	repo: "github.com/CoCreateJS/CoCreate-cli.git",
		// 	exclude: ["link"] // Don't link this package during "coc install"
		// }
	]
};
