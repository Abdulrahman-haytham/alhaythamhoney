export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  frontendUrls: (process.env.FRONTEND_URLS ?? 'http://localhost:3003')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME || 'alhaytham_honey',
    username: process.env.DB_USER || 'alhaytham_user',
    password: process.env.DB_PASSWORD || 'change_me_secure_password',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },
  whatsapp: {
    number: process.env.WHATSAPP_NUMBER || '963947931959',
  },
});
