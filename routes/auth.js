const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const router = express.Router();
const { registerValidation, loginValidation } = require('../middleware/validation');

router.post('/register',registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);

module.exports = router;