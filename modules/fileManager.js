const fs = require('fs');
const {
	getAllFiles,
	uploadToS3,
	getFilePath
} = require("./useS3");

const tmpdir = "/tmp/"

const uploadFiles = async (files, dir) => {
	await Promise.all(files.map(async (file) => {
		await uploadToS3(dir + "/" + file.name, file.path)
		fs.unlink(file.path, () => {})
	}))
}

const saveFilesToLocal = async (files) => {
	return await Promise.all(files.map(async (file) => new Promise((resolve, reject) => {
		file.name = file.name.replace(/(?!\.)[^\w\s]/gi, '_')
		file.name = parseInt(Math.random()*1000) + "_" + file.name

		let fileName = tmpdir + +new Date + "_" + file.name

		const fileContents = Buffer.from(file.data, 'base64')
		fs.writeFile( fileName, fileContents, 'base64', (err) => {
			console.log(err)
			if (err) reject(err)
			resolve({name:file.name,path:fileName})
		})
	})))
}

module.exports = {uploadFiles, saveFilesToLocal}