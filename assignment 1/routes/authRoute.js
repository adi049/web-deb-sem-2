const express = require('express');
const authRouter = express.Router();

const authController = require('../controller/authController');

// User registration
authRouter.post('/register', authController.registerUser);

module.exports = authRouter;