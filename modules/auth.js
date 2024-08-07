const jwt = require('jsonwebtoken')
const {encodeAuth, decodeAuth} = require("./authCodec")
const client = require('../scripts/redisClient')

const auth = (req, res, next) => {
	const token = req.headers["x-authentication"]
	if(token) {
		jwt.verify(token, process.env.authSecretTms || 'authSecretTms', async function(err, decoded) {
			// console.log(decoded)
			if(!err && decoded.exp*1000 > +new Date) {
				// console.log(String(decoded.id), String(token))
				let isValid = await client.hGet(String(decoded.id), String(token))

				if (isValid != "true") {
					console.error(String(decoded.id), String(token))
					return res.status(401).json({message:"Session Expired - logout and login again"})
				}

				req.user = decoded
				req.permissions = decodeAuth({
					page: decoded.perm[0],
					service: decoded.perm[1],
					system: decoded.perm[2],
				})
				req.permissions.isAdmin = Boolean(decoded.admin)
				next()
			} else {
				res.status(401).json({message:"Invalid Auth"})
			}
		});

	} else {
		res.status(401).json({message:"No Auth"})
	}
}

const generate = (data, expiry = 30 * 24 * 60 * 60) => {
	return jwt.sign(data, process.env.authSecretTms || 'authSecretTms', { expiresIn: expiry });
}

const decode = (token) => {
	return jwt.verify(token, process.env.authSecretTms || 'authSecretTms');
}

module.exports = {auth, generate, decode}