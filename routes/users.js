var express = require('express');
const { route } = require('.');
var router = express.Router();

const passport = require('passport');

const authenticate = require('../authentication.js');
const Users = require('../models/users.js');
const cors = require('./cors.js');

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Users.find({})
    .then((Users) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(Users);
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  // mongoose plugin provides us with a method called register.
  Users.register(new Users({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      }
      else {
        if (req.body.firstname)
          user.firstname = req.body.firstname;
        if (req.body.lastname)
          user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          /*to ensure the authenticate was successfull,
          we'll try to authenticated the same user that we just registered.*/
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: 'Registration Success!' });
          });
        })
      }
    })
});

/*second argument call the passport authenticate local
  if the second argument executed suscessfully go to the next callback function, and
  automatically add the user property to the req object message
  otherwise send back a reply to the client about the failure of the authentication. */
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  token = authenticate.getToken({ _id: req.user._id })
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if (req.user) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect('/');
  }
  else {
    var err = new Error('You are not login yet!')
    err.status = 403;
    next(err);
  }
})

router.get('/facebook/token', passport.authenticate('facebook-token', { session: false }), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
  }
});

module.exports = router;