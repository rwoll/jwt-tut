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
    password: 'terriblepassword',
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
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;

    // In reality, we would not want to return this much information about errors
    // we would only want to say that there was a failure
    if (!user) {
      res.json({ success: false, message: 'Auth failed. User not found.'});
    } else if (user) {

      user.comparePassword(req.body.password, function(err, isMatch) {
        if (!isMatch) {
          res.json({ success: false, message: 'Auth fail. Wrong pass.'})
        } else {
          var token = jwt.sign(user, 'aSecret', {
            expiresIn: 600
          });

          res.json({
            success: true,
            message: 'Yes for jwt!',
            token: token
          });
        }
      })
    }
  });
});

// authenticate JWT
apiRoutes.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {

    jwt.verify(token,'aSecret', function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate jwt.'});
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {

    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the API!' });
});

apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

app.use('/api', apiRoutes)
