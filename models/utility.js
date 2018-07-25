var request=require('request');

module.exports.getColor = function(min, max, current){
    if(max < current)
        return 'green';
    else if(min > current)
       return 'red';
    else
        return 'black';
}

// Get Current price of the token from API
//currencyList should be in comma seprate if more than one. like 'USD,BTN'
module.exports.getCurrentPriceByAPI = function(token, currencyList, callback){
    var CurrencyValues;
    request(
        'https://min-api.cryptocompare.com/data/price?fsym=' + token + '&tsyms='+currencyList,
        { json: true }, 
        (err, res, body) => 
        {
        if (err) { return console.log(err); }
        var token = JSON.stringify(body);
        CurrencyValues = JSON.parse(token);  
        //callback function for doing the next things after getting CurrencyValues     
        callback(CurrencyValues);   
        });
}
