// const mongoose = require('mongoose')
// const User = mongoose.model('User')

const aws = require('aws-sdk')

var s3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION_NAME
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

    getGetImageSignedUrl: async function(imageName, folderName) {
        var params = {
            Bucket: `${process.env.S3_BUCKET_NAME}`,
            Key: `${folderName}/${imageName}`
        }

        try { 
            const headCode = await s3.headObject(params).promise();
            const signedUrl = s3.getSignedUrl('getObject', params)
            // Do something with signedUrl
            return signedUrl
          } catch (headErr) {
            if (headErr.code === 'NotFound') {
              // Handle no object on cloud here  
              return ''
            }
          }
    }
}
