const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
	if(req.headers["x-authentication"]) {
		jwt.verify(token, process.env.authSecret || 'authSecret', function(err, decoded) {
			if(!err) {
				req.user = decoded.user
				next()
			}
			res.status(401).json({message:"Invalid Auth"})
			// res.status(401).send()
		});

	} else {
		res.status(401).json({message:"No Auth"})
	}
}

const generate = (data) => {
	return jwt.sign(data, process.env.authSecret || 'authSecret', { expiresIn: 24 * 60 * 60 });
}

const decode = (token) => {
	return jwt.verify(token, process.env.authSecret || 'authSecret');
}

module.exports = {auth, generate, decode}