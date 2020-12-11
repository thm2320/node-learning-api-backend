const path = require('path');

const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://admin:mymongopw@cluster0.ixc3f.mongodb.net/messages?retryWrites=true&w=majority';

const feedRoutes = require('./routes/feed')

const app = express();

//app.use(bodyParser.urlencoded()); //x-www-form-urlencoded
app.use(bodyParser.json()); //applcation/json
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*' /* '*' for any domain, can set the domain defined */);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  res.status(status).json({
    message
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(8080)
  })
  .catch(err => console.log(err));
