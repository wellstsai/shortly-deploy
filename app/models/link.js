var db = require('../config');

var Link = db.mongoose.model('Link', db.urlSchema);




module.exports = Link;