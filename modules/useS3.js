const AWS = require('aws-sdk');
const sstorage = new AWS.S3()
const fs = require("fs")

sstorage.config.update({
	accessKeyId: "AKIAXRPMYGKGXNQCJYF4", 
	secretAccessKey: "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",
	signatureVersion: "v4",
	region: 'ap-south-1'
})
const myBucket = "tmsbucket0721"

const getAllFiles = (filePath, finalResult = [], StartAfter = false) => {
    return new Promise((resolve, reject) => {

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

    const signedUrlExpireSeconds = 60 * minutes;

    return new Promise((resolve, reject) => {

        sstorage.getSignedUrl('getObject', {
            Bucket: myBucket,
            Key: filePath,
            Expires: signedUrlExpireSeconds
        }, (err, result) => {

            if (err)
                return reject(err)

            resolve(result)
        })
    })
}

// uploadToS3("M1000/mad.pdf", process.cwd() + "/ad.pdf").then(() => console.log('done'))
// getAllFiles().then(console.log)
// getFilePath("M1000/mad.pdf").then(console.log)

module.exports = {
	getAllFiles,
	uploadToS3,
	getFilePath
}