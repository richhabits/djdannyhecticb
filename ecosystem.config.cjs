module.exports = {
    apps: [
        {
            name: "djdannyhecticb",
            script: "./dist/index.mjs",
            instances: "max", // Utilize all available CPU cores
            exec_mode: "cluster",
            watch: false,
            max_memory_restart: "1G",
            env_production: {
                NODE_ENV: "production",
            },
            error_file: "logs/error.log",
            out_file: "logs/out.log",
            merge_logs: true,
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
        },
    ],
};
