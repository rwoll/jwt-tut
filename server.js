var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');

var port = process.env.PORT || 4747;
mongoose.connect(config.database);
app.set('aSecretSaghen', config.secret);


app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.listen(port);
console.log('Listening @ http://localhost:' + port);

app.get('/setup', function(req, res) {

  // create a sample user
  // passwords in reality would NEVER be saved as plaintext. Would normally be
  // hashed and salted!
  var cecil = new User({
    name: 'Cecil Sagehen',
    password: 'password',
    admin: true
  });

  cecil.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

//======== API ROUTES ========

var apiRoutes = express.Router();

// TODO: route to authenticate a user
// TODO: token verification

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the API!' });
});

apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

app.use('/api', apiRoutes)
