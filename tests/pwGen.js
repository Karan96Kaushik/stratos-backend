const crypto = require("crypto")

let a = crypto.createHmac('sha256', "someSalt")
			.update("123456")
			.digest('hex')


			console.log(a)