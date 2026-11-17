const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./user');
const adminRoutes = require('./admin');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

// V1 Routes
// const v1Routes = require('./v2');
// router.use('/v1', v1Routes);


module.exports = router;