module.exports = {
  apps: [
    {
      name: "wadhwani-web",
      script: "backend/server.js",
      exec_mode: "cluster",
      instances: "max",
      watch: false,
      max_memory_restart: "400M",
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "wadhwani-worker",
      script: "backend/worker.js",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      max_memory_restart: "300M",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
