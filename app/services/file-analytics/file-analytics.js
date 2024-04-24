"use strict";
const utils = require("../../utils/utils");
const s3InteractionClient = require("../s3InteractionClient/s3InteractionClient");
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_PRESIGNED_URL_EXPIRATION_TIME = process.env.S3_PRESIGNED_URL_EXPIRATION_TIME || 36000; // URL expiration time in seconds
const S3_REGION = process.env.S3_REGION;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const _ = require("lodash");
const UniqueWords = require("../../models/unique-words");
const axios = require('axios');
const THESAURUS_API_KEY = process.env.THESAURUS_API_KEY;
const {Transform} = require('stream');

function countWords(words, wordCounts) {
    for (const word of words) {
        if (word !== '') { // Check if the word is not empty
            const lowercaseWord = word.toLowerCase();
            wordCounts.set(lowercaseWord, (wordCounts.get(lowercaseWord) || 0) + 1);
        }
    }
}

const saveUniqueWordCountDetails = async function (wordCounts, fileDetails) {
    const fileCode = _.get(fileDetails, ["code"]);
    const fileName = _.get(fileDetails, ["fileName"]);
    const uniqueWordCountDetails = {
        code: fileCode,
        fileName: fileName,
        uniqueWords: JSON.stringify(wordCounts)
    };
    const newUniqueWordCountDoc = new UniqueWords(uniqueWordCountDetails);
    await newUniqueWordCountDoc.save();
    console.log('Unique word count details saved successfully.');
};

const processFileAndCountUniqueWords = async function (fileCode) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(`Processing file with code ${fileCode}`);
            const fileDetails = await utils.getFile(fileCode);
            if (_.isEmpty(fileDetails)) {
                return reject(new Error(`No file found with fileCode ${fileCode}`));
            }
            const uniqueWordsCountDetails = await utils.getUniqueWords(fileCode);
            if (_.isEmpty(uniqueWordsCountDetails)) {
                console.log('Fetching file from S3 bucket...');
                const fileName = _.get(fileDetails, ["fileName"]);
                const s3ObjectKey = `${fileName}_${fileCode}`;
                const s3Instance = new s3InteractionClient(S3_REGION, S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY);
                const s3ObjectStream = await s3Instance.downloadFile(S3_BUCKET_NAME, s3ObjectKey);
                const wordCounts = new Map();
                let currentLine = '';
                s3ObjectStream.on('data', (chunk) => {
                    currentLine += chunk.toString();
                    const lines = currentLine.split(/\r?\n/);
                    for (let i = 0; i < lines.length - 1; i++) {
                        const words = lines[i].match(/\b[\w']+\b/g); // Updated regex to include apostrophes
                        if (words) {
                            countWords(words, wordCounts);
                        }
                    }
                    currentLine = lines[lines.length - 1];
                });
                s3ObjectStream.on('end', async () => {
                    const words = currentLine.split(/\s+/);
                    countWords(words, wordCounts);

                    console.log('Unique word counts:');
                    await saveUniqueWordCountDetails(Object.fromEntries(wordCounts), fileDetails);
                    resolve(Object.fromEntries(wordCounts));
                });
                s3ObjectStream.on('error', (error) => {
                    console.error('Error fetching object:', error);
                    reject(error);
                });
            } else {
                console.log('Unique words data already exists in database.');
                resolve(JSON.parse(_.get(uniqueWordsCountDetails, ["uniqueWords"])));
            }

        } catch (e) {
            console.error('Error processing file and counting unique words:', e);
            reject(e);
        }
    });
};

const countSynonymsOfWords = async function (fileCode, words) {
    try {
        console.log(`Counting synonyms of words in file with code ${fileCode}`);
        const uniqueWords = await processFileAndCountUniqueWords(fileCode);
        const synonymPromises = words.map(async (word) => {
            const synonymsAndCount = {
                count: _.get(uniqueWords, [word], 0),
                synonyms: {}
            };

            if (_.has(uniqueWords, [word])) {
                const thesaurusResponse = await axios.get(`https://api.api-ninjas.com/v1/thesaurus?word=${word}`, {
                    headers: {
                        'X-Api-Key': THESAURUS_API_KEY
                    }
                });

                const synonyms = _.get(thesaurusResponse, ["data", "synonyms"]);

                await Promise.all(synonyms.map(async (synonym) => {
                    if (_.has(uniqueWords, [synonym])) {
                        _.set(synonymsAndCount, ['synonyms', synonym], _.get(uniqueWords, [synonym], 0));
                    }
                }));
            }

            return { [word]: synonymsAndCount };
        });

        const synonymResults = await Promise.all(synonymPromises);
        const synonymsAndItsCounts = Object.assign({}, ...synonymResults);
        return synonymsAndItsCounts;
    } catch (error) {
        console.error('Error in counting synonyms of words:', error);
        throw error;
    }
};


function maskWords(content, wordsToMask) {
    for (const word of wordsToMask) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        content = content.replace(regex, '*'.repeat(word.length));
    }
    return content;
}

function createMaskTransform(wordsToMask) {
    return new Transform({
        transform(chunk, encoding, callback) {
            let modifiedChunk = chunk.toString();
            modifiedChunk = maskWords(modifiedChunk, wordsToMask);
            this.push(modifiedChunk);
            callback();
        }
    });
}

const maskWordsInFile = function (fileCode, wordsToMask, res) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(`Masking words in file with code ${fileCode}`);
            const fileDetails = await utils.getFile(fileCode);
            const fileName = _.get(fileDetails, ["fileName"]);
            const s3ObjectKey = `${fileName}_${fileCode}`;
            const s3Instance = new s3InteractionClient(S3_REGION, S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY);
            const s3ObjectStream = await s3Instance.downloadFile(S3_BUCKET_NAME, s3ObjectKey);
            const maskTransform = createMaskTransform(wordsToMask);
            s3ObjectStream.pipe(maskTransform).pipe(res);
            resolve();
        } catch (error) {
            console.error('Error in masking words in file:', error);
            reject(error);
        }
    });
};

module.exports = {
    processFileAndCountUniqueWords: processFileAndCountUniqueWords,
    countSynonymsOfWords: countSynonymsOfWords,
    maskWordsInFile: maskWordsInFile
};
