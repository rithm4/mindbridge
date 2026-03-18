const express = require('express');
const { body } = require('express-validator');
const { register, login, refresh, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('Prenumele este obligatoriu.'),
    body('lastName').trim().notEmpty().withMessage('Numele este obligatoriu.'),
    body('email').isEmail().withMessage('Email invalid.'),
    body('password').isLength({ min: 8 }).withMessage('Parola trebuie să aibă minim 8 caractere.'),
    body('role').isIn(['psychologist', 'patient']).withMessage('Rol invalid.'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalid.'),
    body('password').notEmpty().withMessage('Parola este obligatorie.'),
  ],
  login
);

router.post('/refresh', refresh);
router.post('/logout', protect, logout);

module.exports = router;
