var express = require('express');
var app = express();

app.use('/static', express.static(__dirname + '/static'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('pages/index');
});

app.listen(8080);
console.log('8080 is the magic port');