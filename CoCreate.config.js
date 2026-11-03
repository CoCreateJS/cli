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
    "projects": {
        "client": {
            "path": "../../CoCreate-client",
            "repo": "github.com/CoCreateJS/CoCreate-client.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "server": {
            "path": "../../CoCreate-server",
            "repo": "github.com/CoCreateJS/CoCreate-server.git",
            "exclude": [
                "fs/webpack"
            ]
        }
    },
    "modules": {
        "actions": {
            "path": "../actions",
            "repo": "github.com/CoCreateJS/actions.git"
        },
        "api": {
            "path": "../api",
            "repo": "github.com/CoCreateJS/api.git"
        },
        "aria": {
            "path": "../aria",
            "repo": "github.com/CoCreateJS/aria.git"
        },
        "authenticate": {
            "path": "../authenticate",
            "repo": "github.com/CoCreateJS/authenticate.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "authorize": {
            "path": "../authorize",
            "repo": "github.com/CoCreateJS/authorize.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "autoscaler": {
            "path": "../autoscaler",
            "repo": "github.com/CoCreateJS/autoscaler.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "badging": {
            "path": "../badging",
            "repo": "github.com/CoCreateJS/badging.git"
        },
        "cache": {
            "path": "../cache",
            "repo": "github.com/CoCreateJS/cache.git"
        },
        "cli": {
            "path": ".",
            "repo": "github.com/CoCreateJS/cli.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "clipboard": {
            "path": "../clipboard",
            "repo": "github.com/CoCreateJS/clipboard.git"
        },
        "contact-picker": {
            "path": "../contact-picker",
            "repo": "github.com/CoCreateJS/contact-picker.git"
        },
        "cluster": {
            "path": "../cluster",
            "repo": "github.com/CoCreateJS/cluster.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "config": {
            "path": "../config",
            "repo": "github.com/CoCreateJS/config.git"
        },
        "container": {
            "path": "../container",
            "repo": "github.com/CoCreateJS/container.git"
        },
        "crdt": {
            "path": "../crdt",
            "repo": "github.com/CoCreateJS/crdt.git"
        },
        "cron": {
            "path": "../cron",
            "repo": "github.com/CoCreateJS/cron.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "crud-client": {
            "path": "../crud-client",
            "repo": "github.com/CoCreateJS/crud-client.git"
        },
        "crud-server": {
            "path": "../crud-server",
            "repo": "github.com/CoCreateJS/crud-server.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "css-parser": {
            "path": "../css-parser",
            "repo": "github.com/CoCreateJS/css-parser.git"
        },
        "cursors": {
            "path": "../cursors",
            "repo": "github.com/CoCreateJS/cursors.git"
        },
        "device": {
            "path": "../device",
            "repo": "github.com/CoCreateJS/device.git"
        },
        "docs": {
            "path": "../docs",
            "repo": "github.com/CoCreateJS/docs.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "editor": {
            "path": "../editor",
            "repo": "github.com/CoCreateJS/editor.git"
        },
        "element-prototype": {
            "path": "../element-prototype",
            "repo": "github.com/CoCreateJS/element-prototype.git"
        },
        "elements": {
            "path": "../elements",
            "repo": "github.com/CoCreateJS/elements.git"
        },
        "events": {
            "path": "../events",
            "repo": "github.com/CoCreateJS/events.git"
        },
        "file": {
            "path": "../file",
            "repo": "github.com/CoCreateJS/file.git"
        },
        "filter": {
            "path": "../filter",
            "repo": "github.com/CoCreateJS/filter.git"
        },
        "fullscreen": {
            "path": "../fullscreen",
            "repo": "github.com/CoCreateJS/fullscreen.git"
        },
        "geolocation": {
            "path": "../geolocation",
            "repo": "github.com/CoCreateJS/geolocation.git"
        },
        "lazy-loader": {
            "path": "../lazy-loader",
            "repo": "github.com/CoCreateJS/lazy-loader.git"
        },
        "loadtest": {
            "path": "../loadtest",
            "repo": "github.com/CoCreateJS/loadtest.git"
        },
        "local-storage": {
            "path": "../local-storage",
            "repo": "github.com/CoCreateJS/local-storage.git"
        },
        "notification": {
            "path": "../notification",
            "repo": "github.com/CoCreateJS/notification.git"
        },
        "observer": {
            "path": "../observer",
            "repo": "github.com/CoCreateJS/observer.git"
        },
        "organizations": {
            "path": "../organizations",
            "repo": "github.com/CoCreateJS/organizations.git"
        },
        "plugins": {
            "path": "../plugins",
            "repo": "github.com/CoCreateJS/plugins.git"
        },
        "position": {
            "path": "../position",
            "repo": "github.com/CoCreateJS/position.git"
        },
        "print": {
            "path": "../print",
            "repo": "github.com/CoCreateJS/print.git"
        },
        "pwa": {
            "path": "../pwa",
            "repo": "github.com/CoCreateJS/pwa.git"
        },
        "render": {
            "path": "../render",
            "repo": "github.com/CoCreateJS/render.git"
        },
        "resize": {
            "path": "../resize",
            "repo": "github.com/CoCreateJS/resize.git"
        },
        "scroll": {
            "path": "../scroll",
            "repo": "github.com/CoCreateJS/scroll.git"
        },
        "scrollbar": {
            "path": "../scrollbar",
            "repo": "github.com/CoCreateJS/scrollbar.git"
        },
        "service-worker": {
            "path": "../service-worker",
            "repo": "github.com/CoCreateJS/service-worker.git"
        },
        "search": {
            "path": "../search",
            "repo": "github.com/CoCreateJS/search.git"
        },
        "sitemap": {
            "path": "../sitemap",
            "repo": "github.com/CoCreateJS/sitemap.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "socket-client": {
            "path": "../socket-client",
            "repo": "github.com/CoCreateJS/socket-client.git"
        },
        "socket-server": {
            "path": "../socket-server",
            "repo": "github.com/CoCreateJS/socket-server.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "speech-recognition": {
            "path": "../speech-recognition",
            "repo": "github.com/CoCreateJS/speech-recognition.git"
        },
        "speech-synthesis": {
            "path": "../speech-synthesis",
            "repo": "github.com/CoCreateJS/speech-synthesis.git"
        },
        "state": {
            "path": "../state",
            "repo": "github.com/CoCreateJS/state.git"
        },
        "telemetry": {
            "path": "../telemetry",
            "repo": "github.com/CoCreateJS/telemetry.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "tls": {
            "path": "../tls",
            "repo": "github.com/CoCreateJS/tls.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "usage": {
            "path": "../usage",
            "repo": "github.com/CoCreateJS/usage.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "users": {
            "path": "../users",
            "repo": "github.com/CoCreateJS/users.git"
        },
        "utils": {
            "path": "../utils",
            "repo": "github.com/CoCreateJS/utils.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "validation": {
            "path": "../validation",
            "repo": "github.com/CoCreateJS/validation.git"
        },
        "wake-lock": {
            "path": "../wake-lock",
            "repo": "github.com/CoCreateJS/wake-lock.git"
        },
        "waveform": {
            "path": "../waveform",
            "repo": "github.com/CoCreateJS/waveform.git"
        },
        "web-share": {
            "path": "../web-share",
            "repo": "github.com/CoCreateJS/web-share.git"
        },
        "workflows": {
            "path": "../workflows",
            "repo": "github.com/CoCreateJS/workflows.git",
            "exclude": [
                "fs/webpack"
            ]
        }
    },
    "storages": {
        "amazon-redshift": {
            "path": "../../CoCreate-storages/amazon-redshift",
            "repo": "github.com/CoCreateJS/amazon-redshift.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "auroradb": {
            "path": "../../CoCreate-storages/auroradb",
            "repo": "github.com/CoCreateJS/auroradb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "cockroachdb": {
            "path": "../../CoCreate-storages/cockroachdb",
            "repo": "github.com/CoCreateJS/cockroachdb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "cosmosdb": {
            "path": "../../CoCreate-storages/cosmosdb",
            "repo": "github.com/CoCreateJS/cosmosdb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "documentdb": {
            "path": "../../CoCreate-storages/documentdb",
            "repo": "github.com/CoCreateJS/documentdb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "dqlite": {
            "path": "../../CoCreate-storages/dqlite",
            "repo": "github.com/CoCreateJS/dqlite.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "dynamodb": {
            "path": "../../CoCreate-storages/dynamodb",
            "repo": "github.com/CoCreateJS/dynamodb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "ferretdb": {
            "path": "../../CoCreate-storages/ferretdb",
            "repo": "github.com/CoCreateJS/ferretdb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "firestore": {
            "path": "../../CoCreate-storages/firestore",
            "repo": "github.com/CoCreateJS/firestore.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "indexeddb": {
            "path": "../../CoCreate-storages/indexeddb",
            "repo": "github.com/CoCreateJS/indexeddb.git"
        },
        "mariadb": {
            "path": "../../CoCreate-storages/mariadb",
            "repo": "github.com/CoCreateJS/mariadb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "mongodb": {
            "path": "../../CoCreate-storages/mongodb",
            "repo": "github.com/CoCreateJS/mongodb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "mysql": {
            "path": "../../CoCreate-storages/mysql",
            "repo": "github.com/CoCreateJS/mysql.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "oracledb": {
            "path": "../../CoCreate-storages/oracledb",
            "repo": "github.com/CoCreateJS/oracledb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "planetscale": {
            "path": "../../CoCreate-storages/planetscale",
            "repo": "github.com/CoCreateJS/planetscale.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "postgresql": {
            "path": "../../CoCreate-storages/postgresql",
            "repo": "github.com/CoCreateJS/postgresql.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "qdrant": {
            "path": "../../CoCreate-storages/qdrant",
            "repo": "github.com/CoCreateJS/qdrant.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "rqlite": {
            "path": "../../CoCreate-storages/rqlite",
            "repo": "github.com/CoCreateJS/rqlite.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "sqlite": {
            "path": "../../CoCreate-storages/sqlite",
            "repo": "github.com/CoCreateJS/sqlite.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "tidb": {
            "path": "../../CoCreate-storages/tidb",
            "repo": "github.com/CoCreateJS/tidb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "timescaledb": {
            "path": "../../CoCreate-storages/timescaledb",
            "repo": "github.com/CoCreateJS/timescaledb.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "turso": {
            "path": "../../CoCreate-storages/turso",
            "repo": "github.com/CoCreateJS/turso.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "yugabytedb": {
            "path": "../../CoCreate-storages/yugabytedb",
            "repo": "github.com/CoCreateJS/yugabytedb.git",
            "exclude": [
                "fs/webpack"
            ]
        }
    },
    "plugins": {
        "rollup": {
            "import": "@cocreate/rollup",
            "path": "../../CoCreate-plugins/rollup",
            "repo": "github.com/CoCreateJS/Rollup.git",
            "exclude": [
                "fs/webpack"
            ]
        },
        "webpack": {
            "import": "@cocreate/webpack",
            "path": "../../CoCreate-plugins/webpack",
            "repo": "github.com/CoCreateJS/Webpack.git",
            "exclude": [
                "fs/webpack"
            ]
        }
    }
};
