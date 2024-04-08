const express = require('express');
const router = express.Router();

// Import the controller for file processing
const fileAnalyticsController = require('../../controllers/file-analytics/file-analytics');

router.post('/upload', fileAnalyticsController.saveFile);
router.get('/count/unique', fileAnalyticsController.listAndCountUniqueWords);
router.post('/count/synonyms', fileAnalyticsController.countSynonyms);
router.post('/mask/words', fileAnalyticsController.maskWords);

module.exports = router;
