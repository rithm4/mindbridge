const Appointment = require('../models/Appointment');
const User = require('../models/User');

// GET /api/appointments — programările mele
const getMyAppointments = async (req, res) => {
  try {
    const filter =
      req.user.role === 'psychologist'
        ? { psychologist: req.user._id }
        : { patient: req.user._id };

    const appointments = await Appointment.find(filter)
      .populate('psychologist', 'firstName lastName psychologistProfile avatar')
      .populate('patient', 'firstName lastName avatar')
      .sort({ startTime: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Eroare server.' });
  }
};

// POST /api/appointments — creează programare (doar pacienți)
const createAppointment = async (req, res) => {
  try {
    const { psychologistId, startTime, duration = 50, notes } = req.body;

    const psychologist = await User.findOne({
      _id: psychologistId,
      role: 'psychologist',
      isActive: true,
    });
    if (!psychologist) {
      return res.status(404).json({ message: 'Psihologul nu a fost găsit.' });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    // Verifică conflicte de timp
    const conflict = await Appointment.findOne({
      psychologist: psychologistId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
      ],
    });

    if (conflict) {
      return res.status(409).json({ message: 'Psihologul are deja o programare în acel interval.' });
    }

    const appointment = await Appointment.create({
      psychologist: psychologistId,
      patient: req.user._id,
      startTime: start,
      endTime: end,
      duration,
      notes,
    });

    await appointment.populate([
      { path: 'psychologist', select: 'firstName lastName psychologistProfile avatar' },
      { path: 'patient', select: 'firstName lastName avatar' },
    ]);

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare server.' });
  }
};

// PATCH /api/appointments/:id/status — confirmă/anulează
const updateStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită.' });
    }

    // Verifică că utilizatorul are acces
    const isOwner =
      appointment.psychologist.toString() === req.user._id.toString() ||
      appointment.patient.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({ message: 'Acces interzis.' });
    }

    appointment.status = status;
    if (status === 'cancelled' && cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Eroare server.' });
  }
};

// GET /api/appointments/:id/room — obține roomId pentru video
const getVideoRoom = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită.' });
    }

    const isParticipant =
      appointment.psychologist.toString() === req.user._id.toString() ||
      appointment.patient.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Acces interzis.' });
    }

    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Programarea trebuie să fie confirmată.' });
    }

    res.json({ videoRoomId: appointment.videoRoomId });
  } catch (err) {
    res.status(500).json({ message: 'Eroare server.' });
  }
};

// GET /api/appointments/psychologists — lista psihologi disponibili
const getPsychologists = async (req, res) => {
  try {
    const psychologists = await User.find({
      role: 'psychologist',
      isActive: true,
    }).select('firstName lastName psychologistProfile avatar createdAt');

    res.json(psychologists);
  } catch (err) {
    res.status(500).json({ message: 'Eroare server.' });
  }
};

module.exports = {
  getMyAppointments,
  createAppointment,
  updateStatus,
  getVideoRoom,
  getPsychologists,
};
