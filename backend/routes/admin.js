const adminRoute = require('express').Router();
const { protect } = require('../middleware/authMiddleware'); 
const { adminProtect } = require('../middleware/adminProtect'); 
const AuthController = require('../Controller/AuthController');


// Terapkan Otentikasi dan Otorisasi ADMIN ke SEMUA rute di sini
adminRoute.use(protect, adminProtect); 

adminRoute.get('/users', AuthController.getAllUsers);
adminRoute.put('/users/:id/role', AuthController.updateRole);

module.exports = adminRoute;