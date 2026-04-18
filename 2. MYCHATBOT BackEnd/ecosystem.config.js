module.exports = {
  apps: [
    {
      name: 'whatsapp-bot',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'cloudflared-tunnel',
      script: 'cloudflared.exe',
      args: 'tunnel --config config.yml run',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};














