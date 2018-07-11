var request = require('request');
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Token = require('../models/token');
var CToken=require('../models/tokenlist');
var query=CToken.find();
// Get Homepage
// router.get('/', function(req, res){
// 	res.render('index');
// });

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res) {
  //var query= {username: username};
  Token.find(function(err, content) { 
      res.render('index', {  data:content });
  });
});
function ensureAuthenticated(req, res, next)
{
  if(req.isAuthenticated())
  {
    return next();
  }
  else
  {
    req.flash('error_msg','You are not logged in.');
    res.redirect('/users/login');
  }
}

// Get Create Token
router.get('/createtoken', ensureAuthenticated, function(req, res){
  //res.render('createtoken');
  CToken.find(function(err, content) { 
    res.render('createtoken', {  data:content });
   
  });
});
// Get Create TokenList
router.get('/createtokenlist', ensureAuthenticated, function(req, res){
	res.render('createtokenlist');
});
// Add Token 
router.post('/createtoken', function (req, res) {
  var userid= req.user._id;
  console.log(userid);
	var currency = req.body.currency;
	var min=req.body.min;
	var max=req.body.max;
  var tokencode=req.body.tokencode;
  var currentvalue='';
  var lastvalue='';
	//validation
	req.checkBody('currency', 'Currency is required').notEmpty();
	req.checkBody('min', 'Min value is required').notEmpty();
	req.checkBody('max', 'Max value is required').notEmpty();


	var errors=req.validationErrors();

	if(errors){
    console.log(errors);
		res.render('createtoken', {
			errors:errors
		});
	}
	else{
		var newToken = new Token({
      userid: userid,
      tokencode:  tokencode,
			currency: currency,
			min: min,
      max: max,
      currentvalue:currentvalue,
      lastvalue:lastvalue


		});   
          Token.createToken(newToken, function(err, token){
            if(err) throw err;
            console.log(token);
          });
          req.flash('success_msg', 'You are created token');
      
          res.redirect('/');
        }
       
      });  
//Add New Token List
router.post('/createtokenlist', function(req, res){
  var tokencode=req.body.tokencode;
  var tokenname=req.body.tokenname;
  
    //validation
   req.checkBody('tokencode', 'token code is required').notEmpty();
   req.checkBody('tokenname', 'token name is required').notEmpty();
   
   var error=req.validationErrors();
   if(error)
   {
       res.render('createtokenlist', {
     errors:errors
   });
   }
   else{
       var newToken=new CToken({
           tokencode:tokencode,
           tokenname:tokenname
         
       });
       newToken.save(function(err,utoken){
           if(err) throw err;
           query.exec(function(err,utoken){
               if(err) throw err;
              
           })
           req.flash('success_msg', 'You are registered and can now login');
 
           res.redirect('createtokenlist');
       })
 
   }
 
 });  
     // get the tokencode 
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";

// MongoClient.connect(url, function(err, db) {
//  if (err) throw err;
//  var dbo = db.db("CurrencyTracker");
//  dbo.collection("tokens").find({}).toArray( function(err, result) {
//    if (err) throw err;
//    console.log(result.tokencode);
//    db.close();
//  });
// }); 
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/CurrencyTracker";

// MongoClient.connect(url, function(err, db) {

//     var cursor = db.collection('tokens').find();

//     cursor.each(function(err, doc) {

//         console.log(doc);

//     });
// }); 
        
  

module.exports = router;