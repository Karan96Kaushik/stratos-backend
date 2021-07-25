const jwt = require('jsonwebtoken')
const {encodeAuth, decodeAuth} = require("./authCodec")

const auth = (req, res, next) => {
	const token = req.headers["x-authentication"]
	if(token) {
		jwt.verify(token, process.env.authSecretTms || 'authSecretTms', function(err, decoded) {
			// console.log(decoded)
			if(!err && decoded.exp*1000 > +new Date) {
				req.user = decoded
				req.permissions = decodeAuth({
					page: decoded.perm[0],
					service: decoded.perm[1],
				})
				next()
			} else {
				res.status(401).json({message:"Invalid Auth"})
			}
		});

	} else {
		res.status(401).json({message:"No Auth"})
	}
}

const generate = (data) => {
	return jwt.sign(data, process.env.authSecretTms || 'authSecretTms', { expiresIn: 30 * 24 * 60 * 60 });
}

const decode = (token) => {
	return jwt.verify(token, process.env.authSecretTms || 'authSecretTms');
}

module.exports = {auth, generate, decode}