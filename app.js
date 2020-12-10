const express = require('express');
const bodyParser = require('body-parser')

const feedRoutes = require('./routes/feed')

const app = express();

//app.use(bodyParser.urlencoded()); //x-www-form-urlencoded
app.use(bodyParser.json()); //applcation/json

app.use('/feed', feedRoutes);

app.listen(8080)