const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")

const path = process.env.inFile
const name = process.env.inFile.split("/").pop()
const outPath = process.env.outPath ?? "dbBackups"

uploadFiles([{name, path}], outPath)
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e)
		process.exit(0)
	})
