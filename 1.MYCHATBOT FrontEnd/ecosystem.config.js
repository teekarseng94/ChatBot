module.exports = {
  apps: [
    {
      name: 'landing-page',
      script: 'npm',
      args: 'run dev',
      cwd: './Mychatbot',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      error_file: './logs/landing-page-error.log',
      out_file: './logs/landing-page-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'backend',
      script: 'npm',
      args: 'run dev',
      cwd: './Mychatbot Backend',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};


