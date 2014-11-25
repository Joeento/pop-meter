Popularity Meter 2.0
====================

A Simple Facebook App
---------------------

A couple years ago, I had a lot of success with a simple facebook app called the "Popularity Meter".
Basically, it analyzed facebook a user's profile facebook info and returned their popularity as a number (no less than 60 so that it wouldn't hurt anyone's feelings).
The app was pretty basic but it was fun to use, and ended up with over a million users across India and Africa, so now, I figured it would be a good chance try it again as a stand-alone web app.  This will be my first node app released into production, so feel free to call me out on any mistakes! 

### Setup

First, copy config_example.js to config.js.  Then, edit the file to include your Facebook app info. Finally, run the following commands:
```
npm install
bower install
node server.js
```

Special thanks to [Scotch.io](http://scotch.io/tutorials/javascript/use-ejs-to-template-your-node-application) for help working with ejs!