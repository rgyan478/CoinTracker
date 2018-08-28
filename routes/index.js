var request = require('request');
    express = require('express');
    router = express.Router();
    User = require('../models/user');
    Token = require('../models/token');
    CToken=require('../models/tokenlist');
    Utility = require('../models/utility');
    flash = require('connect-flash');
    query=CToken.find();

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res) {  
  
  var isAdmin=req.user.isAdmin; 
  try
  {    
    if(isAdmin == true)//
    {
          Token.aggregate([
            {
                  $lookup:
                        {
                          from:'tokenlists',
                          localField:'tokencode',
                          foreignField:'tokencode',
                          as:'tokenlist'
                        }
            },
            {$sort:{tokencode:1}}
            
        ],function(err, content) { 
            res.render('index',{ data:content });         
          });
   }
   else
   {
    var userId= req.user._id;   
              Token.aggregate([
                {
                      $lookup:
                            {
                              from:'tokenlists',
                              localField:'tokencode',
                              foreignField:'tokencode',
                              as:'tokenlist'
                            }
                },
                {
                
                  $match:{userid:userId.toString()}     
                }  
                ,
                {$sort:{tokencode:1}}
               
            ],function(err, content) { 
                res.render('index',{ data:content });                                
              });
      }
     }    
      catch(error )
      {    
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }

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
  try
  { 
    var sortTokenName={tokenname:1};
    var condtionalQuery=CToken.find().sort(sortTokenName);
      CToken.find(condtionalQuery,function(err, content) 
      { 
        res.render('createtoken', {  data:content});
        });
    }
      catch(error )
      {    
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }
  });


// Get view tokenlist TokenList
router.get('/admintokenview', ensureAuthenticated, function(req, res){
    try
    {
      CToken.find(function(err, content) 
      { 
      res.render('admintokenview', {  data:content });
      });
    }
    catch(error )
      {    
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }
 
});

//Get Create Tokenlist
router.get('/createtokenlist', ensureAuthenticated, function(req, res){
      try
      {
        res.render('createtokenlist');
      }
      catch(error )
      {    
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }
    
});
// Get Cancle TokenList
router.get('/', ensureAuthenticated, function(req, res){
    try
    {
      res.render('index');
    }
    catch(error )
    {    
      req.flash('error_msg',error.toString());
      res.redirect('error');
    }
});
router.get('/error', ensureAuthenticated, function(req, res){
	res.render('error');
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
       try
       {              
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
              });  
              res.redirect('/');
            }});
          }
      
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }
    
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
       try
       {     
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
        catch(error)
        {
          req.flash('error_msg',error.toString());
          res.redirect('error');
        }
     }
 
 });  

 
//Delete Tokens
router.get('/delete/:id', function(req, res) { 
  var db = req.db; 
  var uid = req.params.id.toString();    
    var conditionQuery = {_id:uid };
      try
      {
        Token.deleteToken(conditionQuery, function(err, res) {
          if (err) throw err;
          console.log("1 document delete");    
        });
        res.redirect('/');  
      }
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }

});


//Find value and bind textbox for edit Tokens
router.get('/edit/:id', function(req, res) 
{ 
  var db = req.db; 
    var  uid = req.params.id;    
    var conditionQuery = {_id:uid };   
    try
    {
      Token.find(conditionQuery,function(err, content) 
      {      
        res.render('edit', {  data:content[0] });       
      })
    }
    catch(error)
    {
      req.flash('error_msg',error.toString());
      res.redirect('error');
    }

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
  try
  {
    newValues = { $set: {tokencode:tokencode,currency:currency,min:min,max:max,colorclass:color}};        
    Token.updateTokenbyId(conditionQuerys, newValues, function(err, res)
      {
          if (err) throw err;
          console.log("Token  updated");
      });
    res.redirect('/'); 

  }
  catch(error)
  {
    req.flash('error_msg',error.toString());
    res.redirect('error');
  }
  
});
//---------------------------------End--------------------------------------------------------------//
//---------------------------------------------Start Token List Update And Delete-----------------------------//
 //-------------------------------Delete Token List-----------------------------------------------------------//  
router.get('/deleted/:id', function(req, res) { 
  var db = req.db; 
  var uid = req.params.id.toString();    
    var conditionQuery = {_id:uid };    
    try
    {
          CToken.deleteToken(conditionQuery, function(err, res) {
            if (err) throw err;
            console.log("Token List delete");    
           });
           res.redirect('/admintokenview');  
    }
      catch(error)
      {
          req.flash('error_msg',error.toString());
          res.redirect('error');
      }

});
//------------------Edit TokenList---------------------------------------------------------//
router.post('/updatetokenlist', function (req, res) {  
  var id=req.body.id.toString();
  var tokencode = req.body.tokencode;
	var tokenname=req.body.tokenname;
  var  conditionQuerys = {_id:id};  
      try
      {
        newValues = { $set: {tokencode:tokencode,tokenname:tokenname}};        
        CToken.updateTokenbyId(conditionQuerys, newValues, function(err, res)
          {
              if (err) throw err;
              console.log("Tokenlist  updated");
          });
        res.redirect('admintokenview'); 
      }
        catch(error)
        {
          req.flash('error_msg',error.toString());
          res.redirect('error');
        }

});
//------------------Find value and bind textbox for edit TokenList----------------------------//
router.get('/Edittokenlist/:id', function(req, res) { 
    var db = req.db; 
    var  uid = req.params.id;    
    var conditionQuery = {_id:uid };   
    try
    {
            CToken.find(conditionQuery,function(err, content) {               
              res.render('Edittokenlist', {  data:content[0] });
              console.log("Tokenlist",content) ;    
            })
    }
    catch(error)
    {
    req.flash('error_msg',error.toString());
    res.redirect('error');
    }

});
//----------------------------------------End---------------------------------------//
//Mute sound
router.post('/mutevolume',function(req,res){
   var isMute=req.user.isMute; 
   var getUserId=req.user._id;
   if(isMute==true)
   {
    newValues = { $set: {isMute:0}};
   }
   else
   {
    newValues = { $set: {isMute:1}};
   }
    
   var  conditionQuerys = {_id:getUserId};
   User.updateToken(conditionQuerys,newValues,function(err,res){
    if (err) throw err;
              console.log("Update volume");
   });

   res.redirect('/'); 
});

module.exports = router;