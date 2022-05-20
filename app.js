const express = require('express')
const session = require('express-session')
const app     = express()
const bodyParser = require('body-parser')
const timings = require('server-timings')
const morgan = require('morgan')
// const passport = require('passport')

const routes  = require('./routes');
require('./scripts/db');

global.adminIDs = [
	"60bcdcf13c1c2a1751864354", // Karan The First
	"6130dc761ee03e38423def2e"	// Shantanu
]

function errorHandler (err, req, res, next) {
	res.status(500)
	res.render('error', { error: err })
}

app.use(bodyParser.raw({limit: '25mb'}) );
app.use(express.json({limit: '25mb'}));
app.use(bodyParser.urlencoded({limit: "25mb",extended: false}));

// app.use(session({ secret: "cats" }));

app.use(morgan('dev'));
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
app.use(routes.packages)
app.use(routes.dashboard)

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