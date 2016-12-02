var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var mongoose = require('../app/config').mongoose;
mongoose.Promise = require('bluebird');
var User = require('../app/models/user');
var Link = require('../app/models/link');


exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({})
  .then(function(links) {
    res.status(200).send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }


  Link.findOne({ url: uri }).then(function(found) {
    console.log('link find result:', found);
    if (found) {
      res.json(found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        }).save()
        .then(function(newLink) {
          res.json(newLink);
        });
      });
    }
  });
};



exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;


  User.findOne({username: username}).exec()
  .then(function(user) {
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }).exec()
    .then(function(user) {
      if (user.length === 0) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save()
          .then(function(newUser) {
            util.createSession(req, res, newUser);
          });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] })
  .then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {

      link.visits++;
      link.save();
      res.redirect(link.url);
    }
  });
};