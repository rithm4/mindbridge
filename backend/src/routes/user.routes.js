const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getMe, updateMe, getPsychologistProfile } = require('../controllers/user.controller');

const router = express.Router();

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.get('/psychologists/:id', protect, getPsychologistProfile);

module.exports = router;
