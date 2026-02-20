module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio-builder',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development'
};
