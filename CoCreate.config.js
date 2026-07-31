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
            repo: "github.com/CoCreate-app/CoCreateJS.git",
            exclude: [
                "fs/webpack"
            ]
        },
        app: {
            path: "../../CoCreate-app",
            repo: "github.com/CoCreate-app/CoCreate-app.git",
            exclude: [
                "fs/webpack"
            ]
        },
        website: {
            path: "../../CoCreate-website",
            repo: "github.com/CoCreate-app/CoCreate-website.git",
            exclude: [
                "fs/webpack"
            ]
        },

        actions: {
            path: "../CoCreate-actions",
            repo: "github.com/CoCreate-app/CoCreate-actions.git"
        },
        api: {
            path: "../CoCreate-api",
            repo: "github.com/CoCreate-app/CoCreate-api.git"
        },
        attributes: {
            path: "../CoCreate-attributes",
            repo: "github.com/CoCreate-app/CoCreate-attributes.git"
        },
        cache: {
            path: "../CoCreate-cache",
            repo: "github.com/CoCreate-app/CoCreate-cache.git"
        },
        calculate: {
            path: "../CoCreate-calculate",
            repo: "github.com/CoCreate-app/CoCreate-calculation.git"
        },
        cli: {
            path: "../CoCreate-cli",
            repo: "github.com/CoCreate-app/CoCreate-cli.git",
            exclude: [
                "fs/webpack"
            ]
        },
        clipboard: {
            path: "../CoCreate-clipboard",
            repo: "github.com/CoCreate-app/CoCreate-clipboard.git"
        },
        clone: {
            path: "../CoCreate-clone",
            repo: "github.com/CoCreate-app/CoCreate-clone.git"
        },
        codearea: {
            path: "../CoCreate-codearea",
            repo: "github.com/CoCreate-app/CoCreate-codearea.git"
        },
        "conditional-logic": {
            path: "../CoCreate-conditional-logic",
            repo: "github.com/CoCreate-app/CoCreate-conditional-logic.git"
        },
        config: {
            path: "../CoCreate-config",
            repo: "github.com/CoCreate-app/CoCreate-config.git"
        },
        crdt: {
            path: "../CoCreate-crdt",
            repo: "github.com/CoCreate-app/CoCreate-crdt.git"
        },

        "crud-client": {
            path: "../CoCreate-crud-client",
            repo: "github.com/CoCreate-app/CoCreate-crud-client.git"
        },
        "css-parser": {
            path: "../CoCreate-css-parser",
            repo: "github.com/CoCreate-app/CoCreate-css-parser.git"
        },
        cursors: {
            path: "../CoCreate-cursors",
            repo: "github.com/CoCreate-app/CoCreate-cursors.git"
        },
        dnd: {
            path: "../CoCreate-dnd",
            repo: "github.com/CoCreate-app/CoCreate-dnd.git"
        },
        docs: {
            path: "../CoCreate-docs",
            repo: "github.com/CoCreate-app/CoCreate-docs.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "element-config": {
            path: "../CoCreate-element-config",
            repo: "github.com/CoCreate-app/CoCreate-element-config.git"
        },
        "element-prototype": {
            path: "../CoCreate-element-prototype",
            repo: "github.com/CoCreate-app/CoCreate-element-prototype.git"
        },
        elements: {
            path: "../CoCreate-elements",
            repo: "github.com/CoCreate-app/CoCreate-elements.git"
        },
        events: {
            path: "../CoCreate-events",
            repo: "github.com/CoCreate-app/CoCreate-events.git"
        },
        file: {
            path: "../CoCreate-file",
            repo: "github.com/CoCreate-app/CoCreate-file.git"
        },
        filter: {
            path: "../CoCreate-filter",
            repo: "github.com/CoCreate-app/CoCreate-filter.git"
        },
        "floating-label": {
            path: "../CoCreate-floating-label",
            repo: "github.com/CoCreate-app/CoCreate-floating-label.git"
        },
        fullscreen: {
            path: "../CoCreate-fullscreen",
            repo: "github.com/CoCreate-app/CoCreate-fullscreen.git"
        },

        indexeddb: {
            path: "../CoCreate-indexeddb",
            repo: "github.com/CoCreate-app/CoCreate-indexeddb.git"
        },
        industry: {
            path: "../CoCreate-industry",
            repo: "github.com/CoCreate-app/CoCreate-industry.git"
        },
        "lazy-loader": {
            path: "../CoCreate-lazy-loader",
            repo: "github.com/CoCreate-app/CoCreate-lazy-loader.git"
        },
        "local-storage": {
            path: "../CoCreate-local-storage",
            repo: "github.com/CoCreate-app/CoCreate-local-storage.git"
        },
        link: {
            path: "../CoCreate-link",
            repo: "github.com/CoCreate-app/CoCreate-link.git"
        },
        modal: {
            path: "../CoCreate-modal",
            repo: "github.com/CoCreate-app/CoCreate-modal.git"
        },
        notification: {
            path: "../CoCreate-notification",
            repo: "github.com/CoCreate-app/CoCreate-notification.git"
        },
        observer: {
            path: "../CoCreate-observer",
            repo: "github.com/CoCreate-app/CoCreate-observer.git"
        },
        organizations: {
            path: "../CoCreate-organizations",
            repo: "github.com/CoCreate-app/CoCreate-organizations.git"
        },
        "overlay-scroll": {
            path: "../CoCreate-overlay-scroll",
            repo: "github.com/CoCreate-app/CoCreate-overlay-scroll.git"
        },
        parallax: {
            path: "../CoCreate-parallax",
            repo: "github.com/CoCreate-app/CoCreate-parallax.git"
        },
        state: {
            path: "../CoCreate-state",
            repo: "github.com/CoCreate-app/CoCreate-state.git"
        },
        position: {
            path: "../CoCreate-position",
            repo: "github.com/CoCreate-app/CoCreate-position.git"
        },
        print: {
            path: "../CoCreate-print",
            repo: "github.com/CoCreate-app/CoCreate-print.git"
        },
        progress: {
            path: "../CoCreate-progress",
            repo: "github.com/CoCreate-app/CoCreate-progress.git"
        },
        pwa: {
            path: "../CoCreate-pwa",
            repo: "github.com/CoCreate-app/CoCreate-pwa.git"
        },
        "random-color": {
            path: "../CoCreate-random-color",
            repo: "github.com/CoCreate-app/CoCreate-random-color.git"
        },
        remove: {
            path: "../CoCreate-remove",
            repo: "github.com/CoCreate-app/CoCreate-remove.git"
        },

        render: {
            path: "../CoCreate-render",
            repo: "github.com/CoCreate-app/CoCreate-render.git"
        },
        resize: {
            path: "../CoCreate-resize",
            repo: "github.com/CoCreate-app/CoCreate-resize.git"
        },
        "rich-text": {
            path: "../CoCreate-rich-text",
            repo: "github.com/CoCreate-app/CoCreate-rich-text.git"
        },
        scroll: {
            path: "../CoCreate-scroll",
            repo: "github.com/CoCreate-app/CoCreate-scroll.git"
        },
        search: {
            path: "../CoCreate-search",
            repo: "github.com/CoCreate-app/CoCreate-search.git"
        },
        select: {
            path: "../CoCreate-select",
            repo: "github.com/CoCreate-app/CoCreate-select.git"
        },
        selection: {
            path: "../CoCreate-selection",
            repo: "github.com/CoCreate-app/CoCreate-selection.git"
        },
        "socket-client": {
            path: "../CoCreate-socket-client",
            repo: "github.com/CoCreate-app/CoCreate-socket-client.git"
        },
        "social-share": {
            path: "../CoCreate-social-share",
            repo: "github.com/CoCreate-app/CoCreate-social-share.git"
        },
        text: {
            path: "../CoCreate-text",
            repo: "github.com/CoCreate-app/CoCreate-text.git"
        },
        toolbar: {
            path: "../CoCreate-toolbar",
            repo: "github.com/CoCreate-app/CoCreate-toolbar.git"
        },
        unique: {
            path: "../CoCreate-unique",
            repo: "github.com/CoCreate-app/CoCreate-unique.git"
        },
        users: {
            path: "../CoCreate-users",
            repo: "github.com/CoCreate-app/CoCreate-users.git"
        },
        utils: {
            path: "../CoCreate-utils",
            repo: "github.com/CoCreate-app/CoCreate-utils.git"
        },
        validation: {
            path: "../CoCreate-validation",
            repo: "github.com/CoCreate-app/CoCreate-validation.git"
        },
        vdom: {
            path: "../CoCreate-vdom",
            repo: "github.com/CoCreate-app/CoCreate-vdom.git"
        },

        builder: {
            path: "../../CoCreate-apps/CoCreate-builder",
            repo: "github.com/CoCreate-app/CoCreate-builder.git",
            exclude: [
                "fs/webpack"
            ]
        },
        dashboard: {
            path: "../../CoCreate-apps/CoCreate-dashboard",
            repo: "github.com/CoCreate-app/CoCreate-dashboard.git",
            exclude: [
                "fs/webpack"
            ]
        },
        datatable: {
            path: "../../CoCreate-apps/CoCreate-datatable",
            repo: "github.com/CoCreate-app/CoCreate-datatable.git",
            exclude: [
                "fs/webpack"
            ]
        },
        kanban: {
            path: "../../CoCreate-apps/CoCreate-kanban",
            repo: "github.com/CoCreate-app/CoCreate-kanban.git",
            exclude: [
                "fs/webpack"
            ]
        },
        sandbox: {
            path: "../../CoCreate-apps/CoCreate-sandbox",
            repo: "github.com/CoCreate-app/CoCreate-sandbox.git",
            exclude: [
                "fs/webpack"
            ]
        },

        charts: {
            path: "../../CoCreate-plugins/CoCreate-charts",
            repo: "github.com/CoCreate-app/CoCreate-charts.git"
        },
        "alpha-vantage": {
            path: "../../CoCreate-plugins/CoCreate-alpha-vantage",
            repo: "github.com/CoCreate-app/CoCreate-alpha-vantage.git"
        },
        aos: {
            path: "../../CoCreate-plugins/CoCreate-aos",
            repo: "github.com/CoCreate-app/CoCreate-aos.git"
        },
        croppie: {
            path: "../../CoCreate-plugins/CoCreate-croppie",
            repo: "github.com/CoCreate-app/CoCreate-croppie.git"
        },
        domain: {
            path: "../../CoCreate-plugins/CoCreate-domain",
            repo: "github.com/CoCreate-app/CoCreate-domain.git"
        },
        fabric: {
            path: "../../CoCreate-plugins/CoCreate-fabric",
            repo: "github.com/CoCreate-app/CoCreate-fabric.git"
        },
        facebook: {
            path: "../../CoCreate-plugins/CoCreate-facebook",
            repo: "github.com/CoCreate-app/CoCreate-facebook.git"
        },
        fullcalendar: {
            path: "../../CoCreate-plugins/CoCreate-fullcalendar",
            repo: "github.com/CoCreate-app/CoCreate-fullcalendar.git"
        },
        ffmpeg: {
            path: "../../CoCreate-plugins/CoCreate-ffmpeg",
            repo: "github.com/CoCreate-app/CoCreate-ffmpeg.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "google-maps": {
            path: "../../CoCreate-plugins/CoCreate-google-maps",
            repo: "github.com/CoCreate-app/CoCreate-google-maps.git"
        },
        "google-auth": {
            path: "../../CoCreate-plugins/CoCreate-google-auth",
            repo: "github.com/CoCreate-app/CoCreate-google-auth.git"
        },
        instagram: {
            path: "../../CoCreate-plugins/CoCreate-instagram",
            repo: "github.com/CoCreate-app/CoCreate-instagram.git"
        },
        lighthouse: {
            path: "../../CoCreate-plugins/CoCreate-lighthouse",
            repo: "github.com/CoCreate-app/CoCreate-lighthouse.git"
        },
        linkedin: {
            path: "../../CoCreate-plugins/CoCreate-linkedin",
            repo: "github.com/CoCreate-app/CoCreate-linkedin.git"
        },
        marked: {
            path: "../../CoCreate-plugins/CoCreate-marked",
            repo: "github.com/CoCreate-app/CoCreate-marked.git"
        },
        mongodb: {
            path: "../../CoCreate-plugins/CoCreate-mongodb",
            repo: "github.com/CoCreate-app/CoCreate-mongodb.git",
            exclude: [
                "fs/webpack"
            ]
        },
        openai: {
            path: "../../CoCreate-plugins/CoCreate-openai",
            repo: "github.com/CoCreate-app/CoCreate-openai.git"
        },
        pickr: {
            path: "../../CoCreate-plugins/CoCreate-pickr",
            repo: "github.com/CoCreate-app/CoCreate-pickr.git"
        },
        pinterest: {
            path: "../../CoCreate-plugins/CoCreate-pinterest",
            repo: "github.com/CoCreate-app/CoCreate-pinterest.git"
        },
        plaid: {
            path: "../../CoCreate-plugins/CoCreate-plaid",
            repo: "github.com/CoCreate-app/CoCreate-plaid.git"
        },
        prism: {
            path: "../../CoCreate-plugins/CoCreate-prism",
            repo: "github.com/CoCreate-app/CoCreate-prism.git"
        },
        sendgrid: {
            path: "../../CoCreate-plugins/CoCreate-sendgrid",
            repo: "github.com/CoCreate-app/CoCreate-sendgrid.git"
        },
        shipengine: {
            path: "../../CoCreate-plugins/CoCreate-shipengine",
            repo: "github.com/CoCreate-app/CoCreate-shipengine.git"
        },
        stripe: {
            path: "../../CoCreate-plugins/CoCreate-stripe",
            repo: "github.com/CoCreate-app/CoCreate-stripe.git"
        },
        twilio: {
            path: "../../CoCreate-plugins/CoCreate-twilio",
            repo: "github.com/CoCreate-app/CoCreate-twilio.git"
        },
        twitter: {
            path: "../../CoCreate-plugins/CoCreate-twitter",
            repo: "github.com/CoCreate-app/CoCreate-twitter.git"
        },

        cocreatews: {
            path: "../../CoCreateWS",
            repo: "github.com/CoCreate-app/CoCreateWS.git",
            exclude: [
                "fs/webpack"
            ]
        },
        certificates: {
            path: "../CoCreate-certificates",
            repo: "github.com/CoCreate-app/CoCreate-certificates.git",
            exclude: [
                "fs/webpack"
            ]
        },
        authenticate: {
            path: "../CoCreate-authenticate",
            repo: "github.com/CoCreate-app/CoCreate-authenticate.git",
            exclude: [
                "fs/webpack"
            ]
        },
        authorize: {
            path: "../CoCreate-authorize",
            repo: "github.com/CoCreate-app/CoCreate-authorize.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "cron-jobs": {
            path: "../CoCreate-cron-jobs",
            repo: "github.com/CoCreate-app/CoCreate-cron-jobs.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "crud-server": {
            path: "../CoCreate-crud-server",
            repo: "github.com/CoCreate-app/CoCreate-crud-server.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "file-server": {
            path: "../CoCreate-file-server",
            repo: "github.com/CoCreate-app/CoCreate-file-server.git",
            exclude: [
                "fs/webpack"
            ]
        },
        metrics: {
            path: "../CoCreate-metrics",
            repo: "github.com/CoCreate-app/CoCreate-metrics.git",
            exclude: [
                "fs/webpack"
            ]
        },
        server: {
            path: "../CoCreate-server",
            repo: "github.com/CoCreate-app/CoCreate-server.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "server-side-render": {
            path: "../CoCreate-server-side-render",
            repo: "github.com/CoCreate-app/CoCreate-server-side-render.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "socket-server": {
            path: "../CoCreate-socket-server",
            repo: "github.com/CoCreate-app/CoCreate-socket-server.git",
            exclude: [
                "fs/webpack"
            ]
        },
        sitemap: {
            path: "../CoCreate-sitemap",
            repo: "github.com/CoCreate-app/CoCreate-sitemap.git",
            exclude: [
                "fs/webpack"
            ]
        },
        "url-uploader": {
            path: "../CoCreate-url-uploader",
            repo: "github.com/CoCreate-app/CoCreate-url-uploader.git",
            exclude: [
                "fs/webpack"
            ]
        },
        usage: {
            path: "../CoCreate-usage",
            repo: "github.com/CoCreate-app/CoCreate-usage.git",
            exclude: [
                "fs/webpack"
            ]
        },
        webpack: {
            path: "../../CoCreate-plugins/CoCreate-webpack",
            repo: "github.com/CoCreate-app/CoCreate-webpack.git",
            exclude: [
                "fs/webpack"
            ]
        }
    },
    "hideMessage": false
};