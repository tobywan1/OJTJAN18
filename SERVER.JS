// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/User');
const TollGateData = require('./models/TollGateData');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['http://localhost:3000'];

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.options('*', cors());


app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/TollGateData', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});




const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define your MongoDB schema and models here

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});




app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const newUser = new User({ username, password, isAdmin: false }); // Add default isAdmin value

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      return res.json({ message: 'Login successful', isAdmin: user.isAdmin });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/addTollGateData', async (req, res) => {
  const { expressway, entry, exit, vehicle, vehicleClass, price, username } = req.body;

  try {
    console.log('Received request to add TollGateData:', req.body);
    
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newTollGateData = new TollGateData({
      user: user._id,
      expressway,
      entry,
      exit,
      vehicle,
      vehicleClass,
      price,
    });

    await newTollGateData.save();

    console.log('Data added successfully');
    return res.json({ message: 'TollGateData added successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});




app.put('/updateTollGateData/:id', async (req, res) => {
  const { id } = req.params;
  const newData = req.body;

  try {
    const updatedData = await TollGateData.findByIdAndUpdate(id, newData, { new: true });
    res.json(updatedData);
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/deleteTollGateData/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await TollGateData.findByIdAndDelete(id);
    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

