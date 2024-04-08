"use strict";
const utils = require("../../utils/utils")
const s3InteractionClient = require("../s3InteractionClient/s3InteractionClient");
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_PRESIGNED_URL_EXPIRATION_TIME = process.env.S3_PRESIGNED_URL_EXPIRATION_TIME || 36000; // URL expiration time in seconds
const S3_REGION = process.env.S3_REGION;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const _ = require("lodash");
const UniqueWords = require("../../models/unique-words");
const axios = require('axios');
const THESAURUS_API_KEY = process.env.THESAURUS_API_KEY
const { Readable } = require('stream');

function countWords(words, wordCounts) {
    for (const word of words) {
        wordCounts.set(word.toLowerCase(), (wordCounts.get(word) || 0) + 1);
    }
}

const saveUniqueWordCountDetails = async function (wordCounts, fileDetails){
    const fileCode = _.get(fileDetails, ["code"]);
    const fileName = _.get(fileDetails, ["fileName"]);
    const uniqueWordCountDetails = {
        code : fileCode,
        fileName : fileName,
        uniqueWords : JSON.stringify(wordCounts)
    }
    const newUniqueWordCountDoc = new UniqueWords(uniqueWordCountDetails);
    await newUniqueWordCountDoc.save();
}

const processFileAndCountUniqueWords = async function (fileCode) {
    return new Promise(async (resolve, reject) => {
        try {
            const fileDetails = await utils.getFile(fileCode);
            if (_.isEmpty(fileDetails)){
                return reject(new Error(`No file found with fileCode ${fileCode}`));
            }
            const uniqueWordsCountDetails =  await utils.getUniqueWords(fileCode);
            if (_.isEmpty(uniqueWordsCountDetails)){
                const fileName = _.get(fileDetails, ["fileName"]);
                const s3ObjectKey = `${fileName}_${fileCode}`;
                const s3Instance = new s3InteractionClient(S3_REGION, S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY);
                const s3ObjectStream = await s3Instance.downloadFile(S3_BUCKET_NAME, s3ObjectKey);
                const wordCounts = new Map();
                let currentLine = '';
                s3ObjectStream.on('data', (chunk) => {
                    currentLine += chunk.toString();
                    const lines = currentLine.split(/\r?\n/); // Split into lines

                    for (let i = 0; i < lines.length - 1; i++) {
                        const words = lines[i].split(/\s+/); // Split into words
                        countWords(words, wordCounts);
                    }
                    currentLine = lines[lines.length - 1];
                });
                s3ObjectStream.on('end', async () => {
                    const words = currentLine.split(/\s+/);
                    countWords(words, wordCounts);

                    console.log('Unique word counts:');
                    await saveUniqueWordCountDetails(Object.fromEntries(wordCounts), fileDetails);
                    return resolve(Object.fromEntries(wordCounts));
                });
                s3ObjectStream.on('error', (error) => {
                    console.error('Error fetching object:', error);
                    return reject(error);
                });
            }else {
                return resolve(JSON.parse(_.get(uniqueWordsCountDetails, ["uniqueWords"])));
            }

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
};

const countSynonymsOfWords = async function (fileCode, words) {
    const uniqueWords = await processFileAndCountUniqueWords(fileCode);
    const synonymsAndItsCounts = {};
    for (const word of words){
        if (_.has(uniqueWords,[word])){
            synonymsAndItsCounts[word] = {
                "count" : _.get(uniqueWords,[word],0),
                "synonyms" : {}
            };
            const thesaurusResponse = await axios.get(`https://api.api-ninjas.com/v1/thesaurus?word=${word}`,{
                headers: {
                    'X-Api-Key': THESAURUS_API_KEY
                }
            });
            const synonyms = _.get(thesaurusResponse, ["data",  "synonyms"]);
            _.each(synonyms, (synonym)=>{
                if (_.has(uniqueWords,[synonym])){
                    _.set(synonymsAndItsCounts,[word, "synonyms", synonym], _.get(uniqueWords, [synonym],0))
                }
            })
        }
    }
    return synonymsAndItsCounts;
}

async function streamToPromise(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

function maskWords(content, wordsToMask) {
    // Implement your logic to mask words in the content
    // For example, replace each occurrence of the words with asterisks
    for (const word of wordsToMask) {
        const regex = new RegExp(word, 'gi');
        content = content.replace(regex, '*'.repeat(word.length));
    }
    return content;
}

// Function to stream the modified content back to the user
function streamModifiedContent(content, res) {
    const readStream = Readable.from(content);

    // Set appropriate headers for the response
    res.setHeader('Content-Disposition', 'attachment; filename="modified-file.txt"');
    res.setHeader('Content-Type', 'text/plain');

    // Pipe the modified content stream to the response
    readStream.pipe(res);
}


const maskWordsInFile = async function (fileCode, wordsToMask, res) {
    const fileDetails = await utils.getFile(fileCode);
    const fileName = _.get(fileDetails, ["fileName"]);
    const s3ObjectKey = `${fileName}_${fileCode}`;
    const s3Instance = new s3InteractionClient(S3_REGION, S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY);
    const s3ObjectStream = await s3Instance.downloadFile(S3_BUCKET_NAME, s3ObjectKey);
    const fileContent = (await streamToPromise(s3ObjectStream)).toString();

    // Mask words in the file content
    const maskedContent = maskWords(fileContent, wordsToMask);

    // Stream the modified content back to the user
    streamModifiedContent(maskedContent, res);

}

module.exports = {
    processFileAndCountUniqueWords : processFileAndCountUniqueWords,
    countSynonymsOfWords : countSynonymsOfWords,
    maskWordsInFile : maskWordsInFile
}