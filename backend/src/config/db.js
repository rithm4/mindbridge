const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectat');
  } catch (err) {
    console.error('❌ Eroare MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
