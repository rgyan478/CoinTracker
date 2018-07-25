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

//Find Tokenlist Tokename
 module.exports.FindTokenlistname=function(conditionQuery,callback)
 {
    CToken.find(conditionQuery,callback)
 }

 //Delete User Details By Id
module.exports.deleteToken=function(conditionDeleteQuery,callback){
    CToken.deleteOne(conditionDeleteQuery,callback)
 }

 //Find User Deatils By Id
module.exports.FindByIdToken=function(conditionDeleteQuery,callback){
    CToken.findOne(conditionDeleteQuery,callback)
 }
 module.exports.updateTokenbyId = function(conditionQuerys, newValues, callback){
    CToken.updateMany(conditionQuerys, newValues, callback);
 }
 //Find tokencode
 module.exports.FindTokencode=function(conditionQuerys,callback){
    CToken.find(conditionQuerys,callback)
 }
 