const router     = new (require('express')).Router()
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");
const {generate, decode} = require("../modules/auth");
const {Members} = require("../models/Members");
const {encodeAuth, decodeAuth} = require("../modules/authCodec");

router.post("/api/files", async (req, res) => {
	try {
		const file = await getFilePath(req.body.fileName)
		// console.log(file)
		res.json({file})
	} catch (err) {
		console.log(err)
		res.status(404).send()
	}
})

router.post('/api/refresh', async (req, res) => {
	try{
		let user = await Members.findOne({_id: req.user.id})

		if(user) {
			let token = generate({
				id:user._id, 
				perm:[
					user.permissions.page, 
					user.permissions.service
				]})
			
			user = user._doc

			delete user.password
			delete user.createdTime
			delete user.updateTime

			let permissions = decodeAuth(user.permissions)

			user.permissions = permissions
			res.send({user, token})
		} else {
			res.status(401).send("Unauthorized refresh")
		}
	} catch (err) {
			console.log(err)
			res.status(500).send(err.message)
	}


})

module.exports = router