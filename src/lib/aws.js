const AWS = require('aws-sdk')

AWS.config = new AWS.Config({
  accessKeyId: 'AKIA3XZEIFSG6H4BFQGU',
  secretAccessKey: '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',
  region: 'us-east-1'
})

module.exports = AWS
