var request = require('request');
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Token = require('../models/token');
var CToken=require('../models/tokenlist');


//var Tokenarray=require('../models/allarray');
var query=CToken.find();
// Get Homepage
// router.get('/', function(req, res){
// 	res.render('index');
// });

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res) {
  var userid= req.user._id;
  Token.find({userid:userid},function(err, content) { 
      res.render('index', {  data:content });
    });
  });
  
  //Get tokenlistvalues for token name***
var  tokennamelist=[];
var tokennamelists=[];
CToken.FindTokenlistname({},function(err,tokenlist){
  if(err) throw err
for(var i=0;i<tokenlist.length;i++)
{
  tokennamelist[i]=tokenlist[i].tokenname;
}
}); 
router.post('/', ensureAuthenticated, function(req, res) {
  var userid= req.user._id;
  Token.find({userid:userid},function(err, content) { 
      res.render('index', {  data:content });
    
    for(var i=0;i<content.length;i++)
      {
           tokennamelists[i]=content[i].tokencode;
      }
    });
  });
  console.log("lenth of tokenlists",tokennamelists.length);
//compare vale for column
var tokenlistresult=[];
console.log("lenth of result",tokenlistresult.length);
for(var i=0;i<tokennamelist.length;i++)
{
for(var j=0;j<tokennamelists.length;j++)
{
if(tokennamelist[i]==tokennamelists[j])
{
tokenlistresult[i]=tokennamelist[i];
}
else
{
  break;
}
}
}
for(var i=0; i<tokenlistresult.length;i++)
{
console.log("this is result",tokenlistresult[i]);
}


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
    res.render('createtoken', {  data:content});
  });
});


// Get view tokenlist TokenList
router.get('/admintokenview', ensureAuthenticated, function(req, res){
  CToken.find(function(err, content) { 
    res.render('admintokenview', {  data:content });
});


//Get Create Tokenlist
router.get('/createtokenlist', ensureAuthenticated, function(req, res){
  res.render('createtokenlist');
});

	// res.render('admintokenview');
});
// Get Cancle TokenList
router.get('/', ensureAuthenticated, function(req, res){
	res.render('index');
});


// grid token name value



// Add New Coin Currency Token 

router.post('/createtoken', function (req, res) {
  var userid= req.user._id;
	var currency = req.body.currency;
	var min=req.body.min;
	var max=req.body.max;
  var tokencode=req.body.tokencode;
  var currentvalue=0;
  var lastvalue=0; 
  var colorclass='black';
   
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
      tokencode:tokencode,
			currency: currency,
			min: min,
      max: max,
      currentvalue:currentvalue,
      lastvalue:lastvalue,
      colorclass:colorclass
    });     
    var userid= req.user._id;
    //method start for add token
    Token.FindTokencode({userid:userid,currency:currency,tokencode:tokencode},function(err,tokencodes){
      if(err) throw err
  
  if(tokencodes.length > 0 )
   {    
    req.flash('success_msg','Already Exist');
    res.redirect('createtoken');   
   
   }
  else
  {
    Token.createToken(newToken, function(err, token){
      if(err) throw err;
      console.log(token);
    });
    req.flash('success_msg', 'You are created token');

    res.redirect('/');
  }});
  
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
       newToken.save(function(err,utoken){
           if(err) throw err;
           query.exec(function(err,utoken){
               if(err) throw err;
              
           })         
 
           res.redirect('createtokenlist');
       })
 
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
router.get('/edit/:id', function(req, res) { 
  var db = req.db; 
    var  uid = req.params.id;    
    var conditionQuery = {_id:uid };   
    console.log("edit id is ",conditionQuery); 
    Token.find(conditionQuery,function(err, content) { 
      //console.log(content[0]._id);
      res.render('edit', {  data:content[0] });
     // console.log(content) ;    
    })

});


//Edit Token 
router.post('/edit', function (req, res) {
  
  var id=req.body.id.toString();
  var currency = req.body.currency;
	var min=req.body.min;
	var max=req.body.max;
  var tokencode=req.body.tokencode;
  var currentvalue=req.body.currentvalue;
  var  conditionQuerys = {_id:id};  
     newValues = { $set: {tokencode:tokencode,currency:currency,currentvalue:currentvalue,min:min,max:max  }};        
    Token.updateTokenbyId(conditionQuerys, newValues, function(err, res)
      {
     if (err) throw err;
          console.log("Token  updated");
      });
    res.redirect('/'); 

});

 //Delete Token List  

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

module.exports = router;