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
        type: Number
    },
    max:{
        type: Number
    },
    currentvalue:{
        type:Number
    },
    lastvalue:{
        type:Number
    }
  
});

var Token = module.exports = mongoose.model('Token', TokenSchema);

module.exports.createToken = function(newToken, callback){
    newToken.save(callback);
}

module.exports.updateToken = function(conditionQuery, newValues, callback){
   Token.updateMany(conditionQuery, newValues, callback);
}

