var mongoose = require('mongoose');
//Currency Token Schema
var TokenSchema = mongoose.Schema({
   tokencode: {
       type: String,
       index: true
   },
   tokenname: {
       type: String
   }
  
});
var CToken = module.exports = mongoose.model('tokenlist', TokenSchema);