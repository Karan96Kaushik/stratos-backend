const router     = new (require('express')).Router()
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("../modules/useS3");

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

module.exports = router