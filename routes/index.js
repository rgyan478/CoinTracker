var request = require('request');
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Token = require('../models/token');
var CToken=require('../models/tokenlist');
var Utility = require('../models/utility');
var flash = require('connect-flash');
var query=CToken.find();

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res) {
  var userid= req.user._id;
  Token.find({userid:userid},function(err, content) { 
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
  CToken.find(function(err, content) { 
    res.render('createtoken', {  data:content});
  });
});


// Get view tokenlist TokenList
router.get('/admintokenview', ensureAuthenticated, function(req, res){
  CToken.find(function(err, content) { 
    res.render('admintokenview', {  data:content });
});
});

//Get Create Tokenlist
router.get('/createtokenlist', ensureAuthenticated, function(req, res){
  
  res.render('createtokenlist');
});
// Get Cancle TokenList
router.get('/', ensureAuthenticated, function(req, res){
	res.render('index');
});

// Add New Coin Currency Token 

router.post('/createtoken', function (req, res) {
  var userid= req.user._id;
	var currency = req.body.currency;
	var min=req.body.min;
	var max=req.body.max;
  var tokencode=req.body.tokencode;
  var currentvalue=0.00000;
  var lastvalue=0.00000;  
  var colorclass=Utility.getColor(min, max, currentvalue);  
	//validation
	req.checkBody('currency', 'Currency is required').notEmpty();
	req.checkBody('min', 'Min value is required').notEmpty();
	req.checkBody('max', 'Max value is required').notEmpty();
	var errors=req.validationErrors();
	if(errors){   
		res.render('createtoken', {
			errors:errors
		});
	}
  else
  {    
    
     //Get Current price 
    Utility.getCurrentPriceByAPI(tokencode, currency, function(currentValues){
      currentvalue=currentValues[currency];
      lastvalue=currentvalue;
      var colorclass=Utility.getColor(min, max, currentvalue);
      var newToken = new Token({
        userid: userid,
        tokencode:tokencode,
        currency: currency,
        min: min,
        max: max,
        currentvalue:currentvalue,
        lastvalue:lastvalue,
        colorclass:colorclass
      });        
       //method start for add token
      Token.FindTokencode({userid:userid,currency:currency,tokencode:tokencode},function(err,tokencodes){
        if(err) throw err        
        if(tokencodes.length > 0 )
        {    
        
          req.flash('error_msg','the token name cannot be added because it is already being tracked.');
          res.redirect('/createtoken');  
        }
        else
        {
          
          Token.createToken(newToken, function(err, token){
            if(err) throw err;
           // console.log(token);
          });  
          res.redirect('/');
        }});
    });//End utility
  
} 
});  //Close post method
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
       //Find Token code and token name 
       CToken.FindTokencode({tokencode:tokencode},function(err,tokencodes)
       {  
         if(err) throw err;        
         if(tokencodes.length > 0)
         {    
           req.flash('error_msg','the token code cannot be added because it is already being  exist.');
           res.redirect('/createtokenlist');  
         }
         else
         {
             newToken.save(function(err,utoken)
             {
               if(err) throw err;
               query.exec(function(err,utoken)
             {
               if(err) throw err;
               
            })     
  
            res.redirect('admintokenview');
        })         
        }});
  }
 
 });  

 
//Delete Tokens
router.get('/delete/:id', function(req, res) { 
  var db = req.db; 
  var uid = req.params.id.toString();    
    var conditionQuery = {_id:uid };
    
    console.log("Id",conditionQuery);
    Token.deleteToken(conditionQuery, function(err, res) {
      if (err) throw err;
      console.log("1 document delete");    
    });
    res.redirect('/');  

});


//Find value and bind textbox for edit Tokens
router.get('/edit/:id', function(req, res) 
{ 
  var db = req.db; 
    var  uid = req.params.id;    
    var conditionQuery = {_id:uid };   
    console.log("edit id is ",conditionQuery); 
    Token.find(conditionQuery,function(err, content) 
    {      
      res.render('edit', {  data:content[0] });       
    })

});

//-----------------------Edit Token, currency,min,max value----------------------------------// 
router.post('/edit', function (req, res) {  
  var id=req.body.id.toString();
  var currency = req.body.currency;
	var min=req.body.min;
	var max=req.body.max;
  var tokencode=req.body.tokencode;
  var currentvalue=req.body.currentvalue;
  var  conditionQuerys = {_id:id};  
  var color=Utility.getColor(min, max, currentvalue);
   newValues = { $set: {tokencode:tokencode,currency:currency,min:min,max:max,colorclass:color}};        
    Token.updateTokenbyId(conditionQuerys, newValues, function(err, res)
      {
     if (err) throw err;
          console.log("Token  updated");
      });
    res.redirect('/'); 

});
//---------------------------------End--------------------------------------------------------------//
//---------------------------------------------Start Token List Update And Delete-----------------------------//
 //-------------------------------Delete Token List-----------------------------------------------------------//  
router.get('/deleted/:id', function(req, res) { 
  var db = req.db; 
  var uid = req.params.id.toString();    
    var conditionQuery = {_id:uid };    
    console.log("Id",conditionQuery);
    CToken.deleteToken(conditionQuery, function(err, res) {
      if (err) throw err;
      console.log("Token List delete");    
    });
   res.redirect('/admintokenview');  

});
//------------------Edit TokenList---------------------------------------------------------//
router.post('/updatetokenlist', function (req, res) {  
  var id=req.body.id.toString();
  var tokencode = req.body.tokencode;
	var tokenname=req.body.tokenname;
  var  conditionQuerys = {_id:id};  
     newValues = { $set: {tokencode:tokencode,tokenname:tokenname}};        
    CToken.updateTokenbyId(conditionQuerys, newValues, function(err, res)
      {
     if (err) throw err;
          console.log("Tokenlist  updated");
      });
    res.redirect('admintokenview'); 

});
//------------------Find value and bind textbox for edit TokenList----------------------------//
router.get('/Edittokenlist/:id', function(req, res) { 
  var db = req.db; 
    var  uid = req.params.id;    
    var conditionQuery = {_id:uid };   
    console.log("edit id is ",conditionQuery); 
    CToken.find(conditionQuery,function(err, content) { 
      //console.log(content[0]._id);
      res.render('Edittokenlist', {  data:content[0] });
      console.log("Tokenlist",content) ;    
    })

});
//----------------------------------------End---------------------------------------//
module.exports = router;