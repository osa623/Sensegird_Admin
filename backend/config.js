module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/sensgrid',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtExpiration: '1d'
};
