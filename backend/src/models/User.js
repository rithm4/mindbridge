const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String, required: true, minlength: 8 },

    // 'psychologist' sau 'patient'
    role: {
      type: String,
      enum: ['psychologist', 'patient'],
      required: true,
    },

    // Câmpuri specifice psihologului
    psychologistProfile: {
      specialization: { type: String, default: '' },
      bio:            { type: String, default: '' },
      pricePerSession: { type: Number, default: 0 }, // RON/sesiune
      yearsExperience: { type: Number, default: 0 },
      languages:       { type: [String], default: ['Română'] },
      isVerified:      { type: Boolean, default: false },
    },

    // Câmpuri specifice pacientului
    patientProfile: {
      dateOfBirth: { type: Date },
      notes:       { type: String, default: '' },
    },

    avatar:    { type: String, default: '' },
    isActive:  { type: Boolean, default: true },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

// Hash parola înainte de salvare
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Metodă pentru verificare parolă
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Elimină parola din răspunsurile JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
