const userRoute = require('express').Router();
const AuthController = require('../Controller/AuthController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Semua rute di bawah ini dilindungi (protected)
userRoute.use(protect); // Middleware proteksi diterapkan ke semua rute di file ini

userRoute.get('/profile', AuthController.getProfile);
userRoute.put('/profile', upload.single('avatar'), AuthController.updateProfile); // Added upload middleware
userRoute.put('/password', AuthController.updatePassword);

module.exports = userRoute;