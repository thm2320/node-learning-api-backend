const path = require('path');

const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://admin:mymongopw@cluster0.ixc3f.mongodb.net/messages?retryWrites=true&w=majority';
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}-${file.originalname}`)
  }
});

const fileFilter = (req, file, cb) => {
  const fileRegex = /^image\/(png|jpg|jpeg)$/
  if (fileRegex.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

//app.use(bodyParser.urlencoded()); //x-www-form-urlencoded
app.use(bodyParser.json()); //applcation/json
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter
  }).single('image')
)
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*' /* '*' for any domain, can set the domain defined */);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({
    message,
    data
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    const server = app.listen(8080)
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('Client connected')
    })

  })
  .catch(err => console.log(err));
