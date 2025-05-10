const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload-proof', upload.single('proof'), (req, res) => {
  const { email } = req.body;
  const filePath = req.file.path;
  console.log(`Proof uploaded by ${email} - File: ${filePath}`);
  res.send({ message: 'Proof of payment received. We will verify and activate shortly.' });
});


const app = express();
const PORT = 5000;
const JWT_SECRET = 'secret_key_here';

require('./db');

app.use(cors());
app.use(express.json());

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password, isTutor } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ name, email, password: hashedPassword, isTutor });
    await user.save();
    res.json({ message: 'Registration successful' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
