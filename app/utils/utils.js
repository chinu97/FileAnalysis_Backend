"use strict";
const mongoose = require("mongoose");
const File = require("../models/file");
const UniqueWords = require("../models/unique-words")
const getFile = function (fileCode) {
    return File.findOne({code : fileCode});
}

const getUniqueWords = function (fileCode) {
    return UniqueWords.findOne({code : fileCode});
}

module.exports = {
    getFile : getFile,
    getUniqueWords : getUniqueWords
}