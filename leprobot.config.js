module.exports = {
    apps: [{
        name: "leprobot",
        script: "./index.js",
        watch: true,
        env: {
            "NODE_ENV": "development",
        },
        autorestart: true,
        output: './out.log',
        error: './error.log',
        log: './combined.outerr.log',
        max_memory_restart: '300M',
        env_production: {
            "NODE_ENV": "production"
        }
    }]
};