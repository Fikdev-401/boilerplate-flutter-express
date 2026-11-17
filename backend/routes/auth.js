const authRoute = require('express').Router()
const AuthController = require('../Controller/AuthController')

authRoute.post('/login', AuthController.login)
authRoute.post('/register', AuthController.register)
authRoute.post('/verify-email', AuthController.verifyEmail)
authRoute.post('/google', AuthController.googleLogin)
authRoute.post('/logout', AuthController.logout)
// authRoute.post('/test-email', AuthController.testEmail)

module.exports = authRoute