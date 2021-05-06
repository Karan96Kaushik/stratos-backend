const express = require('express')
const session = require('express-session')
const app     = express()
const bodyParser = require('body-parser')
const timings = require('server-timings')
// const passport = require('passport')

const routes  = require('./routes');
require('./scripts/db');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.raw({limit: '5mb'}) );


// app.use(session({ secret: "cats" }));

app.use(timings);

app.get('/ping', (req, res) => {
	res.send("OK");
})

/*************** No Auth **********************/

app.use(routes.logIn)
app.use(routes.signUp)

/**************** Auth ************************/

app.use(require('./modules/auth').auth)
app.use(routes.properties)
app.use(routes.tenants)
app.use(routes.payments)

/*****************  ***********************/


app.use(function(req, res, next) {
		let err = new Error('Not Found')
		err.status = 404
		next(err)
})

// module.exports = app

app.listen(7878)