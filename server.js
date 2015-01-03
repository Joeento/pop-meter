/*jslint node: true */
'use strict';

var express = require('express');
var url = require('url');
var FB = require('fb');
var bunyan = require('bunyan');
var config = require('./config');

var app = express();

app.use('/static', express.static(__dirname + '/static'));
app.set('view engine', 'ejs');

var log = bunyan.createLogger({
    name: 'myapp',
    streams: [
        {
            level: 'info',
            path: config.logs.info
        },
        {
            level: 'error',
            path: config.logs.error
        }
    ]
});


app.get('/', function(req, res) {
    log.info('index');
	res.render('pages/index');
});

app.get('/auth', function(req, res) {
	var redirect_uri = encodeURIComponent(req.protocol + '://' + req.headers.host + '/results');
    log.info('auth');
	res.redirect('https://www.facebook.com/dialog/oauth?client_id=' + config.app_id + '&redirect_uri=' + redirect_uri + '&scope=publish_stream,read_stream,user_photos,friends_photos');
});

app.get('/results', function(req, res) {
    log.info('results');
    var url_parts = url.parse(req.url, true);
	FB.api('oauth/access_token', {
    	client_id: config.app_id,
    	client_secret: config.app_secret,
    	redirect_uri: req.protocol + '://' + req.headers.host + '/results',
    	code: url_parts.query.code
	}, function (response) {
        log.info({code: url_parts.query.code,response: response},'access_token');
    	if(!response || response.error) {
            log.error({level: 'response', error: response.error});
            res.redirect('/');
        	return;
		}
        FB.setAccessToken(response.access_token);

        /* Algorithm begins here */
        var max_friends = 600;
        var three_weeks_ago = new Date();
        three_weeks_ago.setDate(three_weeks_ago.getDate()-21);
        var max_photos = 5;
        var max_stream = 5;
        var max_likes = 15;
        FB.api('me/friends', {limit: max_friends}, function (friends) {
            if(!friends || friends.error) {
                log.error({level: 'friends', error: friends.error});
                return;
            }
            FB.api('me/photos', {since: Math.floor(three_weeks_ago.getTime()/1000)}, function (photos) {
                if(!photos || photos.error) {
                    log.error({level: 'photos', error: photos.error});
                    return;
                }
                FB.api('me/statuses', {limit: max_stream}, function (stream) {
                    if(!stream || stream.error) {
                        log.error({level: 'stream', error: stream.error});
                        return;
                    }

                    var likes = 0;
                    for (var i = 0; i<stream.data.length;i++) {
                        likes += stream.data[i].likes.data.length;
                    }
                    var total_friends = Math.min(friends.data.length, max_friends);
                    var total_photos = Math.min(photos.data.length,max_photos);
                    var total_likes = Math.min(likes, max_likes);
                    var pop = ((total_friends/max_friends)*20)
                        + ((total_photos/max_photos)*10)
                        + ((total_likes/max_likes)*10)
                        + 60;
                    pop = Math.round(pop);

                    var byline = 'YOU ARE WELL KNOWN';
                    var image = 70;
                    var desc = 'You are recognizable around your community.  However, if you are not happy, we reccomend introducing yourself to more people, maybe takign some pictures when you go out with friends.';
                    if (pop >= 70 && pop < 80) {
                        byline = 'YOU ARE FAIRLY POPULAR';
                        image = 70;
                        desc = 'Nice job!  You have reached a level of popularity in life you should be proud of.  However, if you are not happy, we reccomend introducing yourself to more people, maybe takign some pictures when you go out with friends.';
                    } else if (pop >= 80 && pop < 90) {
                        byline = 'YOU ARE PRETTY POPULAR';
                        image = 80;
                        desc = 'People must look up to you because your popularity is impressive.  The only thing that could make you any better is if you introduced yourself to more people and networked, but you\'re doing pretty well on your own.';
                    } else if (pop >= 90 && pop < 80) {
                        byline = 'YOU ARE REALLY POPULAR!!!';
                        image = 90;
                        desc = 'Wow!  You are incredibly popular, you have lots of friends and are constantly being included.  Congratulations!!!';
                    }
                    log.info({pop: pop, math: '(('  +total_friends+'/'+max_friends+')*20)' 
                        + '+ ((' + total_photos+ '/'+max_photos+')*10)'
                        +' + ((' + total_likes + '/'+max_likes+'*10) + 60;'}, 'success');

                    res.render('pages/results', {pop: pop, byline: byline, image: image, desc: desc, app_id: config.app_id});
                });
            });

        });

        /* Algorithm ends here */
	});
    //Log an error?
	
    });
    
    app.get('/contact', function(req, res) {
        res.render('pages/contact');
    });

    app.get('/privacy-policy', function(req, res) {
        res.render('pages/privacy-policy');
    });
app.listen(config.port);
log.info('Server has started on port ' + config.port);