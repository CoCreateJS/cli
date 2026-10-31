module.exports = {
    "organization_id": "",
    "key": "",
    "host": "",
    "sources": [
        {
            "array": "files",
            "object": {
                "_id": "637ca36250234ef1671ce30f",
                "name": "index.html",
                "path": "/docs/cli",
                "pathname": "/docs/cli/index.html",
                "src": "{{./docs/index.html}}",
                "host": [
                    "*"
                ],
                "directory": "cli",
                "content-type": "{{content-type}}",
                "public": "true"
            }
        }
    ],
    modules: {
        cocreatejs: {
            path: "../../CoCreateJS",
            repo: "gitlab.com/cocreatejs/CoCreateJS.git",
            exclude: [
                "fs/webpack"
            ]
        },
        app: {
            path: "../../CoCreate-app",
            repo: "gitlab.com/cocreatejs/CoCreate-app.git",
            exclude: [
                "fs/webpack"
            ]
        },
        website: {
            path: "../../CoCreate-website",
            repo: "gitlab.com/cocreatejs/CoCreate-website.git",
            exclude: [
                "fs/webpack"
            ]
        },
        actions: {
            path: "../CoCreate-actions",
            repo: "gitlab.com/cocreatejs/CoCreate-actions.git"
        },
        api: {
            path: "../CoCreate-api",
            repo: "gitlab.com/cocreatejs/CoCreate-api.git"
        },
        cache: {
            path: "../CoCreate-cache",
            repo: "gitlab.com/cocreatejs/CoCreate-cache.git"
        },
        cli: {
            path: "../CoCreate-cli",
            repo: "gitlab.com/cocreatejs/CoCreate-cli.git",
            exclude: [
                "fs/webpack"
            ]
        },
        clipboard: {
            path: "../CoCreate-clipboard",
            repo: "gitlab.com/cocreatejs/CoCreate-clipboard.git"
        },
        config: {
            path: "../CoCreate-config",
            repo: "gitlab.com/cocreatejs/CoCreate-config.git"
        },
        crdt: {
            path: "../CoCreate-crdt",
            repo: "gitlab.com/cocreatejs/CoCreate-crdt.git"
        },

        "crud-client": {
            path: "../CoCreate-crud-client",
            repo: "gitlab.com/cocreatejs/CoCreate-crud-client.git"
        },
        "css-parser": {
            path: "../CoCreate-css-parser",
            repo: "gitlab.com/cocreatejs/CoCreate-css-parser.git"
        },
        cursors: {
            path: "../CoCreate-cursors",
            repo: "gitlab.com/cocreatejs/CoCreate-cursors.git"
        },

        docs: {
            path: "../CoCreate-docs",
            repo: "gitlab.com/cocreatejs/CoCreate-docs.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "element-config": {
            path: "../CoCreate-element-config",
            repo: "gitlab.com/cocreatejs/CoCreate-element-config.git"
        },
        "element-prototype": {
            path: "../CoCreate-element-prototype",
            repo: "gitlab.com/cocreatejs/CoCreate-element-prototype.git"
        },
        elements: {
            path: "../CoCreate-elements",
            repo: "gitlab.com/cocreatejs/CoCreate-elements.git"
        },
        events: {
            path: "../CoCreate-events",
            repo: "gitlab.com/cocreatejs/CoCreate-events.git"
        },
        file: {
            path: "../CoCreate-file",
            repo: "gitlab.com/cocreatejs/CoCreate-file.git"
        },
        filter: {
            path: "../CoCreate-filter",
            repo: "gitlab.com/cocreatejs/CoCreate-filter.git"
        },
        fullscreen: {
            path: "../CoCreate-fullscreen",
            repo: "gitlab.com/cocreatejs/CoCreate-fullscreen.git"
        },
        indexeddb: {
            path: "../CoCreate-indexeddb",
            repo: "gitlab.com/cocreatejs/CoCreate-indexeddb.git"
        },
        "lazy-loader": {
            path: "../CoCreate-lazy-loader",
            repo: "gitlab.com/cocreatejs/CoCreate-lazy-loader.git"
        },
        "local-storage": {
            path: "../CoCreate-local-storage",
            repo: "gitlab.com/cocreatejs/CoCreate-local-storage.git"
        },
        link: {
            path: "../CoCreate-link",
            repo: "gitlab.com/cocreatejs/CoCreate-link.git"
        },
        notification: {
            path: "../CoCreate-notification",
            repo: "gitlab.com/cocreatejs/CoCreate-notification.git"
        },
        observer: {
            path: "../CoCreate-observer",
            repo: "gitlab.com/cocreatejs/CoCreate-observer.git"
        },
        organizations: {
            path: "../CoCreate-organizations",
            repo: "gitlab.com/cocreatejs/CoCreate-organizations.git"
        },
        state: {
            path: "../CoCreate-state",
            repo: "gitlab.com/cocreatejs/CoCreate-state.git"
        },
        position: {
            path: "../CoCreate-position",
            repo: "gitlab.com/cocreatejs/CoCreate-position.git"
        },
        print: {
            path: "../CoCreate-print",
            repo: "gitlab.com/cocreatejs/CoCreate-print.git"
        },
        pwa: {
            path: "../CoCreate-pwa",
            repo: "gitlab.com/cocreatejs/CoCreate-pwa.git"
        },
        render: {
            path: "../CoCreate-render",
            repo: "gitlab.com/cocreatejs/CoCreate-render.git"
        },
        resize: {
            path: "../CoCreate-resize",
            repo: "gitlab.com/cocreatejs/CoCreate-resize.git"
        },
        scroll: {
            path: "../CoCreate-scroll",
            repo: "gitlab.com/cocreatejs/CoCreate-scroll.git"
        },
        search: {
            path: "../CoCreate-search",
            repo: "gitlab.com/cocreatejs/CoCreate-search.git"
        },
        selection: {
            path: "../CoCreate-selection",
            repo: "gitlab.com/cocreatejs/CoCreate-selection.git"
        },
        "socket-client": {
            path: "../CoCreate-socket-client",
            repo: "gitlab.com/cocreatejs/CoCreate-socket-client.git"
        },
        "social-share": {
            path: "../CoCreate-social-share",
            repo: "gitlab.com/cocreatejs/CoCreate-social-share.git"
        },
        users: {
            path: "../CoCreate-users",
            repo: "gitlab.com/cocreatejs/CoCreate-users.git"
        },
        utils: {
            path: "../CoCreate-utils",
            repo: "gitlab.com/cocreatejs/CoCreate-utils.git"
        },
        validation: {
            path: "../CoCreate-validation",
            repo: "gitlab.com/cocreatejs/CoCreate-validation.git"
        },
        cocreatews: {
            path: "../../CoCreateWS",
            repo: "gitlab.com/cocreatejs/CoCreateWS.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "server-tls": {
            path: "../CoCreate-server-tls",
            repo: "gitlab.com/cocreatejs/CoCreate-server-tls.git",
            exclude: [
                "fs/webpack"
            ]
        },
        authenticate: {
            path: "../CoCreate-authenticate",
            repo: "gitlab.com/cocreatejs/CoCreate-authenticate.git",
            exclude: [
                "fs/webpack"
            ]
        },
        authorize: {
            path: "../CoCreate-authorize",
            repo: "gitlab.com/cocreatejs/CoCreate-authorize.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "cron-jobs": {
            path: "../CoCreate-cron-jobs",
            repo: "gitlab.com/cocreatejs/CoCreate-cron-jobs.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "crud-server": {
            path: "../CoCreate-crud-server",
            repo: "gitlab.com/cocreatejs/CoCreate-crud-server.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "file-server": {
            path: "../CoCreate-file-server",
            repo: "gitlab.com/cocreatejs/CoCreate-file-server.git",
            exclude: [
                "fs/webpack"
            ]
        },
        metrics: {
            path: "../CoCreate-metrics",
            repo: "gitlab.com/cocreatejs/CoCreate-metrics.git",
            exclude: [
                "fs/webpack"
            ]
        },
        server: {
            path: "../CoCreate-server",
            repo: "gitlab.com/cocreatejs/CoCreate-server.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "server-side-render": {
            path: "../CoCreate-server-side-render",
            repo: "gitlab.com/cocreatejs/CoCreate-server-side-render.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "socket-server": {
            path: "../CoCreate-socket-server",
            repo: "gitlab.com/cocreatejs/CoCreate-socket-server.git",
            exclude: [
                "fs/webpack"
            ]
        },
        sitemap: {
            path: "../CoCreate-sitemap",
            repo: "gitlab.com/cocreatejs/CoCreate-sitemap.git",
            exclude: [
                "fs/webpack"
            ]
        },
        usage: {
            path: "../CoCreate-usage",
            repo: "gitlab.com/cocreatejs/CoCreate-usage.git",
            exclude: [
                "fs/webpack"
            ]
        },
        webpack: {
            path: "../../CoCreate-plugins/CoCreate-webpack",
            repo: "gitlab.com/cocreatejs/CoCreate-webpack.git",
            exclude: [
                "fs/webpack"
            ]
        }
    }
};
