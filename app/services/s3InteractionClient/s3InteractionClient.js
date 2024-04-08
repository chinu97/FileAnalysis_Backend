const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PassThrough } = require('stream');

class S3InteractionClient {
    constructor(region, accessKeyId, secretAccessKey) {
        if (!S3InteractionClient.instance) {
            this.s3Client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
            S3InteractionClient.instance = this;
        }

        return S3InteractionClient.instance;
    }

    async generatePresignedUploadUrl(bucketName, objectKey, fileType, expirationTimeInSeconds) {
        const params = {
            Bucket: bucketName,
            Key: objectKey,
            ContentType: fileType
        };

        const command = new PutObjectCommand(params);
        return getSignedUrl(this.s3Client, command, { expiresIn: expirationTimeInSeconds });
    }

    async generatePresignedDownloadUrl(bucketName, objectKey, expirationTimeInSeconds) {
        const params = {
            Bucket: bucketName,
            Key: objectKey
        };

        const command = new GetObjectCommand(params);
        return getSignedUrl(this.s3Client, command, { expiresIn: expirationTimeInSeconds });
    }

    async downloadFile(bucketName, objectKey) {
        const params = {
            Bucket: bucketName,
            Key: objectKey
        };

        try {
            const { Body } = await this.s3Client.send(new GetObjectCommand(params));
            return Body;
        } catch (error) {
            console.error('Error downloading file from S3:', error);
            throw error;
        }
    }
}

S3InteractionClient.instance = null;

module.exports = S3InteractionClient;
