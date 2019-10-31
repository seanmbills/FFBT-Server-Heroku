const mongoose = require('mongoose')
const User = mongoose.Schema('User')

const aws = require('aws-sdk')

var s3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: 'us-east-1'
})

module.exports = {
    getPostImageSignedUrl: function (imageName, folderName) {
        var params = {
            Bucket: `${process.env.S3_BUCKET_NAME}`,
            Key: `${folderName}/${imageName}`,
            ContentType: 'image/jpeg',
            Expires: 3600
        }

        var url = s3.getSignedUrl('putObject', params)
        return url
    },

    getGetImageSignedUrl: function(imageName, folderName) {
        var params= {
            Bucket: `${process.env.S3_BUCKET_NAME}`,
            Key: `${folderName}/${imageName}`,
            ContentType: 'image/jpeg',
            Expires: 3600
        }

        var url = s3.getSignedUrl('getObject', params)
        return url
    }
}
