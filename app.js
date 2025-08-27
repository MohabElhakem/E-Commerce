const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

// conect mongo
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log( " ✔︎ MongoDB Connected " ))
.catch((err)=>console.error(" ✗ MongoDB connection error;",err) );

// Globel middleware 
app.use(express.json());

// Mount the routers here ▽ 


app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server on port 3000
app.listen(3000,()=> console.log('✔︎ Server running on http://localhost:3000'));