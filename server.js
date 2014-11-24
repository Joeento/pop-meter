var express = require('express');
var url = require('url');
var FB = require('FB');
var config = require('./config');

var app = express();

app.use('/static', express.static(__dirname + '/static'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('pages/index');
});

app.get('/auth', function(req, res) {
	var redirect_uri = encodeURIComponent(req.protocol + '://' + req.headers.host + '/results')
	res.redirect('https://www.facebook.com/dialog/oauth?client_id=' + config.app_id + '&redirect_uri=' + redirect_uri + '&scope=publish_stream,read_stream,user_photos,friends_photos');
});

app.get('/results', function(req, res) {
    var url_parts = url.parse(req.url, true);
	FB.api('oauth/access_token', {
    	client_id: config.app_id,
    	client_secret: config.app_secret,
    	redirect_uri: req.protocol + '://' + req.headers.host + '/results',
    	code: url_parts.query.code
	}, function (response) {
    	if(!response || response.error) {
        	console.log(!response ? 'error occurred' : response.error);
        	return;
		}
        FB.setAccessToken(response.access_token);
        res.render('pages/results', {access_token: response.access_token});
	});
    //Log an error?
	
});

app.listen(8080);
console.log('8080 is the magic port');