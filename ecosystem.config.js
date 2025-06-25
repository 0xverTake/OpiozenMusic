module.exports = {
  apps: [
    {
      name: "zenbeat",
      script: "index.js",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
      // Restart the app if it uses more than 300MB of memory
      max_memory_restart: "300M",
      // Auto restart if the app crashes
      autorestart: true,
      // Error log file path
      error_file: "logs/error.log",
      // Out log file path
      out_file: "logs/out.log",
      // Merge logs
      merge_logs: true,
      // Log date format
      time: true,
      // Wait for Lavalink to start before starting the bot
      wait_ready: true,
      // Dependencies to wait for
      depends_on: ["lavalink"]
    },
    {
      name: "lavalink",
      script: "./start-lavalink.sh",
      cwd: "./",
      interpreter: "/bin/bash",
      watch: false,
      // Restart the app if it uses more than 1GB of memory
      max_memory_restart: "1G",
      // Auto restart if the app crashes
      autorestart: true,
      // Error log file path
      error_file: "logs/lavalink-error.log",
      // Out log file path
      out_file: "logs/lavalink-out.log",
      // Merge logs
      merge_logs: true,
      // Log date format
      time: true
    }
  ]
};
