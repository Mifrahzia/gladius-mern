module.exports = {
  apps: [
    {
      name: "gladius-backend",
      script: "src/server.js",
      cwd: "/opt/gladius/backend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "400M",
      env: { NODE_ENV: "production" }
      // runtime vars come from /opt/gladius/backend/.env via dotenv.config() in server.js
    }
  ]
};