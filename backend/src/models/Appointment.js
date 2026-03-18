const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const appointmentSchema = new mongoose.Schema(
  {
    psychologist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Data și ora programării
    startTime: { type: Date, required: true },
    endTime:   { type: Date, required: true },

    // Durata în minute (implicit 50 min = sesiune standard)
    duration: { type: Number, default: 50 },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },

    // Camera video unică pentru această programare
    videoRoomId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },

    notes: { type: String, default: '' },

    // Motiv anulare
    cancellationReason: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index pentru căutare rapidă după psiholog/pacient + dată
appointmentSchema.index({ psychologist: 1, startTime: 1 });
appointmentSchema.index({ patient: 1, startTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
