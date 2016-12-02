var path = require('path');
var mongoose = require('mongoose');
var Promise = require('bluebird');
mongoose.Promise = require('bluebird');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');

mongoose.connect('mongodb://localhost/shortlyDb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to Mongoose!');
});

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: {type: Number, default: 0},
  timestamp: Date
});

urlSchema.pre('save', true, function(next, done) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  next();
  done();
});

var userSchema = new Schema({
  username: String,
  password: String,
  timestamp: Date
});

userSchema.pre('save', true, function(next, done) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
      done();
    });
});

userSchema.methods.comparePassword = function(passwordAttempt, cb) {
  bcrypt.compare(passwordAttempt, this.password, function(err, isMatch) {
    cb(isMatch);
  });

};

module.exports.urlSchema = urlSchema;
module.exports.userSchema = userSchema;
module.exports.mongoose = mongoose;