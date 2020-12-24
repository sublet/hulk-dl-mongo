const AWS = require('aws-sdk');

AWS.config = new AWS.Config({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SEC,
  region: 'us-east-1',
});

module.exports = AWS;
