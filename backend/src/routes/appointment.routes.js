const express = require('express');
const { protect, requireRole } = require('../middleware/auth.middleware');
const {
  getMyAppointments,
  createAppointment,
  updateStatus,
  getVideoRoom,
  getPsychologists,
} = require('../controllers/appointment.controller');

const router = express.Router();

// Toți utilizatorii autentificați
router.get('/', protect, getMyAppointments);
router.get('/psychologists', protect, getPsychologists);
router.get('/:id/room', protect, getVideoRoom);

// Doar pacienți
router.post('/', protect, requireRole('patient'), createAppointment);

// Ambele roluri
router.patch('/:id/status', protect, updateStatus);

module.exports = router;
