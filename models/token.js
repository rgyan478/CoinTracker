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
    },
    colorclass:{
        type:String
      
    }
  
});

var Token = module.exports = mongoose.model('Token', TokenSchema);

module.exports.createToken = function(newToken, callback){
    newToken.save(callback);
}

module.exports.updateToken = function(conditionQuery, newValues, callback){
   Token.updateMany(conditionQuery, newValues, callback);
}
//Delete User Details By Id
module.exports.deleteToken=function(conditionDeleteQuery,callback){
   Token.deleteOne(conditionDeleteQuery,callback)
}
//Find User Deatils By Id
module.exports.FindByIdToken=function(conditionDeleteQuery,callback){
   Token.findOne(conditionDeleteQuery,callback)
}
//Update Tokens values by Id
module.exports.updateTokenbyId = function(conditionQuerys, newValues, callback){
   Token.updateMany(conditionQuerys, newValues, callback);
}

//Find tokencode
module.exports.FindTokencode=function(conditionQuery,callback){
    Token.find(conditionQuery,callback)
 }

 