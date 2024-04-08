const express = require('express');
const router = express.Router();

const s3Controller = require('../../controllers/s3/s3');

router.get('/generate-presigned-url', s3Controller.generatePresignedUrl);

module.exports = router;
