"use strict";
const _ = require("lodash");
const File = require('../../models/file');
const fileAnalyticsService = require("../../services/file-analytics/file-analytics");

exports.saveFile = async function (req, res) {
    try {
        const body = _.get(req, ["body"]);
        const fileCode = _.get(body, ["fileCode"])
        const fileName = _.get(body, ["fileName"]);
        const fileSize = _.get(body, ["fileSize"]);
        const uploadDate = new Date();
        const fileDetails = {
            code: fileCode,
            fileName: fileName,
            contentType: 'text/plain',
            size: fileSize,
            uploadDate: uploadDate
        };
        const newFile = new File(fileDetails);
        await newFile.save();
        res.send({
            success: true,
            message: "File saved successfully"
        });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).send({
            success: false,
            message: "Failed to save file"
        });
    }
}


exports.listAndCountUniqueWords = async function (req, res) {
    try {
        const fileCode = _.get(req, ["query", "fileCode"]);

        const wordCount = await fileAnalyticsService.processFileAndCountUniqueWords(fileCode);
        res.send({
            success: true,
            uniqueWordCount: wordCount
        });
    } catch (error) {
        console.error('Error in counting unique words', error);
        res.status(500).send({
            success: false,
            uniqueWordCount : null,
            error : "Error in finding unique words and their counts. Please try again later"
        });
    }
}

exports.countSynonyms = async function (req, res) {
    try {
        const body = _.get(req, ["body"]);
        const fileCode = _.get(body, ["fileCode"]);
        const words = _.get(body, ["words"], []);
        const synonymsCount = await fileAnalyticsService.countSynonymsOfWords(fileCode, words);
        res.send(synonymsCount);
    } catch (error) {
        console.error('Error in countSynonyms:', error);
        res.status(500).send({ error: "Error in finding synonyms. Please try again later" });
    }
}

exports.maskWords = async function (req, res) {
    try {
        const body = _.get(req, ["body"]);
        const fileCode = _.get(body, ["fileCode"]);
        const wordsToMask = _.get(body, ["words"], []);
        await fileAnalyticsService.maskWordsInFile(fileCode, wordsToMask, res);
    } catch (error) {
        console.error('Error in maskWords:', error);
        res.status(500).send({ error: "Error in masking words. Please try again later" });
    }
}


