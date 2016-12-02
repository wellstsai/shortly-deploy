var db = require('../config');

var User = db.mongoose.model('users', db.userSchema);




module.exports = User;