const express = require('express')
const session = require('express-session')
const app     = express()
const bodyParser = require('body-parser')
const timings = require('server-timings')
const passport = require('passport')

const routes  = require('./routes');
require('./scripts/db');

// var passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
	{
	    usernameField: 'email',
	    passwordField: 'password'
	},
	function(username, password, done) {
		User.findOne({ username: username }, function (err, user) {
			if (err) { return done(err); }
			if (!user) {
				return done(null, false, { message: 'Incorrect username.' });
			}
			if (!user.validPassword(password)) {
				return done(null, false, { message: 'Incorrect password.' });
			}
			return done(null, user);
		});
	}
));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.raw({limit: '5mb'}) );

app.use(passport.initialize());
app.use(passport.session());

app.use(session({ secret: "cats" }));

app.use(timings);

app.get('/ping', (req, res) => {
	res.send("OK");
})

/*************** No Auth **********************/

app.use(routes.logIn)
app.use(routes.signUp)

/**************** Auth ************************/

app.use(require('./modules/auth'))

/*****************  ***********************/


app.use(function(req, res, next) {
		let err = new Error('Not Found')
		err.status = 404
		next(err)
})

// module.exports = app

app.listen(7878)