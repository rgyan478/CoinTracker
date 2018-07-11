var mongoose = require('mongoose');

//Token Schema
var TokenSchema = mongoose.Schema({
    userid: {
        type: String
    },
    tokencode: {
        type: String
    },
    currency: {
        type: String,
        index: true
    },
    min: {
        type: String
    },
    max:{
        type: String
    },
    currentvalue:{
        type:String
    },
    lastvalue:{
        type:String
    }
  
});

var Token = module.exports = mongoose.model('Token', TokenSchema);

module.exports.createToken = function(newToken, callback){
    newToken.save(callback);
}