const express = require('express')
const session = require('express-session')
const app     = express()
const bodyParser = require('body-parser')
const timings = require('server-timings')
// const passport = require('passport')

const routes  = require('./routes');
require('./scripts/db');

function errorHandler (err, req, res, next) {
	res.status(500)
	res.render('error', { error: err })
}

app.use(express.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.raw({limit: '5mb'}) );

// app.use(session({ secret: "cats" }));

app.use(timings);

app.get('/api/ping', (req, res) => {
	res.send("OK");
})

/*************** No Auth **********************/

app.use(routes.logIn)
app.use(routes.signUp)

/**************** Auth ************************/

app.use(require('./modules/auth').auth)
app.use(routes.clients)
app.use(routes.members)
app.use(routes.tasks)
app.use(routes.leads)
app.use(routes.quotations)
app.use(routes.invoices)
app.use(routes.utils)
app.use(routes.accounts)
app.use(routes.payments)

/*****************  ***********************/

const handleErrors = (err, req, res, next) => {
	return res.status(500).json({
		status: 'error',
		message: err.message
	});
}

app.use(handleErrors);
// module.exports = app

app.listen(7878)