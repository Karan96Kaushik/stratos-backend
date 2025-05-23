const AWS = require('aws-sdk');
const sstorage = new AWS.S3()
const fs = require("fs")

sstorage.config.update({
	accessKeyId: process.env.S3ID, 
	secretAccessKey: process.env.S3Secret,
	signatureVersion: "v4",
	region: 'ap-south-1'
})
// const myBucket = "tmsbucket0721"
const myBucket = "tms0001"

const getAllFiles = (filePath, finalResult = [], StartAfter = false) => {
    return new Promise((resolve, reject) => {
        // return resolve([])
        let obj = {
            Bucket: myBucket,
            Prefix: filePath
            // StartAfter: 'DLimages/1234710419005.jpg'
        }

        if (StartAfter) {
            obj.StartAfter = StartAfter;
        }

        sstorage.listObjectsV2(obj, async (err, result) => {
        	// console.log(result)

            if (err)
                return reject(err)

            finalResult = [...finalResult, ...result.Contents];
            let contentLength = result.Contents.length;
            if (result.KeyCount < 1000) {
                return resolve(finalResult);
            }
            let recursive = await getAllFiles(filePath, finalResult, result.Contents[contentLength-1].Key);
        })
    })
}

const uploadToS3 = (s3Path="", localFilePath="", option) => {

    // return

    if (!localFilePath || !localFilePath.trim().length) {
        return Promise.reject(new Error("Invalid local file destination path"));
    }

    if (!s3Path || !s3Path.trim().length) {
        return Promise.reject(new Error("Invalid S3 destination path"));
    }

    const body = fs.createReadStream(localFilePath);

    const s3Params = {
        Bucket: myBucket,
        Key: s3Path,
        Body: body
    };

    if (option && option.contentType && option.contentType.length) {
        s3Params.ContentType = option.contentType;
    }

    return sstorage
	    .upload(s3Params)
	    .promise()
	    .then( () => 'Done uploading.')
	    .catch(error => {
	        return Promise.reject(error);
	    })

}

const getFilePath = (filePath, minutes = 5) => {

    // return

    const signedUrlExpireSeconds = 60 * minutes;

    return new Promise((resolve, reject) => {

        sstorage.getSignedUrl('getObject', {
            Bucket: myBucket,
            Key: filePath,
            Expires: signedUrlExpireSeconds,
            ResponseContentDisposition: `inline; filename="${encodeURIComponent(filePath)}"`,
            ResponseContentType: filePath.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'
        }, (err, result) => {

            if (err)
                return reject(err)

            resolve(result)
        })
    })
}

// List all files in PREQ*
const listAllFiles = (prefix) => {
    return new Promise((resolve, reject) => {
        sstorage.listObjectsV2({
            Bucket: myBucket,
            Prefix: prefix
        }, (err, result) => {
            if (err)
                return reject(err)

            resolve(result)
        })
    })
}

// delete file from s3
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        sstorage.deleteObject({
            Bucket: myBucket,
            Key: filePath
        }, (err, result) => {
            if (err)
                return reject(err)

            resolve(result)
        })
    })
}

// deleteFile("PREQ0012/211_53047246.pdf")
// .then(console.log)
// .then(() => 
//     listAllFiles("PREQ")
//         .then(f => console.log(f.Contents.map(c => c.Key)))
// )


// listAllFiles("PREQ").then(console.log)

// uploadToS3("M1000/mad.pdf", process.cwd() + "/ad.pdf").then(() => console.log('done'))
// getAllFiles().then(console.log)
// getFilePath("M1000/mad.pdf").then(console.log)

module.exports = {
	getAllFiles,
	uploadToS3,
	getFilePath
}