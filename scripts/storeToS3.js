const {uploadFiles, saveFilesToLocal} = require("../modules/fileManager")

const name = process.env.inFile.split("/").pop()
const outPath = process.env.outPath ?? "dbBackups"

uploadFiles([{name, path:name}], outPath)
	.then(() => process.exit(0))
	.catch(console.log)
