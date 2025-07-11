const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const cors = require('cors');

// Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:8081', 'http://localhost:3000'];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
router.use(cors(corsOptions));

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require authentication)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/change-password', auth, userController.changePassword);

// Admin only routes
router.get('/all', auth, userController.getAllUsers);
router.put('/:id/role', auth, userController.updateUserRole);
router.put('/:id/deactivate', auth, userController.deactivateUser);

module.exports = router;
