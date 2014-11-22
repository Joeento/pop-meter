var express = require('express');
var config = require('./config');
var app = express();

app.use('/static', express.static(__dirname + '/static'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('pages/index');
});

app.get('/auth', function(req, res) {
	var redirect_uri = encodeURIComponent('http://localhost:8080/results')
	res.redirect('https://www.facebook.com/dialog/oauth?client_id=' + config.app_id + '&redirect_uri=' + redirect_uri + '&scope=publish_stream,read_stream,user_photos,friends_photos');
});

app.get('/results', function(req, res) {

	res.render('pages/results');
});

app.listen(8080);
console.log('8080 is the magic port');