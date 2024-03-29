const path = require('path');

const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://admin:mymongopw@cluster0.ixc3f.mongodb.net/messages?retryWrites=true&w=majority';
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql')
const { v4: uuidv4 } = require('uuid');

const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')
const auth = require('./middleware/auth')
const { clearImage } = require('./util/file')

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
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth)

app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated!');
  }
  if (!req.file) {
    return res.status(200).json({ message: 'No file provided!' });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res.status(201).json({ message: 'File stored', filePath: req.file.path.replace(/\\/g, "/") })
});

app.use('/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || 'An error occurred';
      const code = err.originalError.code || 500;
      return {
        message: message,
        status: code,
        data: data
      }
    }
  })
)

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
    app.listen(8080);
  })
  .catch(err => console.log(err));

