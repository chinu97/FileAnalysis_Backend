"use strict";
const s3InteractionClient = require("../../services/s3InteractionClient/s3InteractionClient");
const _ = require("lodash")
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_PRESIGNED_URL_EXPIRATION_TIME = process.env.S3_PRESIGNED_URL_EXPIRATION_TIME || 36000; // URL expiration time in seconds
const S3_REGION = process.env.S3_REGION;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;


exports.generatePresignedUrl = async function (req, res) {
    try {
        // TODO handle different files with same name
        const fileName = _.get(req, ["query", "fileName"]);
        const fileCode = _.get(req, ["query", "fileCode"])
        const s3Instance = new s3InteractionClient(S3_REGION, S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY);
        const preSignedUrl = await s3Instance.generatePresignedUploadUrl(S3_BUCKET_NAME, `${fileName}_${fileCode}`, "text/plain");

        res.send({
            "pre-signed-url" : preSignedUrl,
        });
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        res.status(500).json({ error: 'Failed to generate pre-signed URL' });
    }
}

