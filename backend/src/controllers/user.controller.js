const User = require('../models/User');

// GET /api/users/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// PATCH /api/users/me
const updateMe = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'avatar'];

    if (req.user.role === 'psychologist') allowedFields.push('psychologistProfile');
    if (req.user.role === 'patient') allowedFields.push('patientProfile');

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare server.' });
  }
};

// GET /api/users/psychologists/:id — profil public psiholog
const getPsychologistProfile = async (req, res) => {
  try {
    const psychologist = await User.findOne({
      _id: req.params.id,
      role: 'psychologist',
      isActive: true,
    }).select('firstName lastName psychologistProfile avatar createdAt');

    if (!psychologist) {
      return res.status(404).json({ message: 'Psihologul nu a fost găsit.' });
    }
    res.json(psychologist);
  } catch (err) {
    res.status(500).json({ message: 'Eroare server.' });
  }
};

module.exports = { getMe, updateMe, getPsychologistProfile };
