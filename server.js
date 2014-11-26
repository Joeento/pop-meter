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

        /* Algorithm begins here */
        var max_friends = 600;
        var three_weeks_ago = new Date();
        three_weeks_ago.setDate(three_weeks_ago.getDate()-21);
        console.log(three_weeks_ago.getTime());
        var max_photos = 5;
        var max_stream = 5;
        var max_likes = 15;
        FB.api('me/friends', {limit: max_friends}, function (friends) {
            if(!friends || friends.error) {
                console.log(!friends ? 'error occurred' : friends.error);
                return;
            }
            FB.api('me/photos', {since: three_weeks_ago.getTime()}, function (photos) {
                if(!photos || photos.error) {
                    console.log(!photos ? 'error occurred' : photos.error);
                    return;
                }
                FB.api('me/statuses', {limit: max_stream}, function (stream) {
                    if(!stream || stream.error) {
                        console.log(!stream ? 'error occurred' : stream.error);
                        return;
                    }

                    var likes = 0;
                    var photo_likes = 0;
                    for (var i = 0; i< stream.data.length;i++) {
                        likes += stream.data[i].likes.data.length;
                    }
                    var total_friends = Math.min(friends.data.length, max_friends);
                    var total_photos = Math.min(photos.data.length,max_photos);
                    var total_likes = Math.min(likes, max_likes);
                    var pop = ((total_friends/max_friends)*20)
                        + ((total_photos/max_photos)*10)
                        + ((total_likes/max_likes)*10)
                        + 60;
                    console.log("(("  +total_friends+"/"+max_friends+")*20)" 
                        + "+ ((" + total_photos+ "/"+max_photos+")*10)"
                        +" + ((" + total_likes + "/"+max_likes+"*10) + 60;");
                    res.render('pages/results', {pop: parseInt(pop)});
                });
            });

        });

        /* Algorithm ends here */

       
	});
    //Log an error?
	
});

app.listen(8080);
console.log('8080 is the magic port');