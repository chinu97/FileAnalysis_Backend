"use strict";
const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const FileAnalysisController = require('../../app/controllers/file-analytics/file-analytics');
const File = require('../../app/models/file');
const fileAnalyticsService = require("../../app/services/file-analytics/file-analytics");

describe('File Controller', function () {
    describe('saveFile', function () {
        it('should save the file successfully', async function () {
            console.log("Running saveFile test - should save the file successfully");
            const req = {
                body: {
                    fileCode: '123456',
                    fileName: 'example.txt',
                    fileSize: 1024
                }
            };
            const res = {
                send: sinon.stub()
            };
            sinon.stub(File.prototype, 'save').resolves();
            await FileAnalysisController.saveFile(req, res);
            sinon.assert.calledWith(res.send, {
                success: true,
                message: "File saved successfully"
            });
            console.log("saveFile test completed successfully");
            File.prototype.save.restore();
        });

        it('should handle errors while saving the file', async function () {
            console.log("Running saveFile test - should handle errors while saving the file");
            const req = {
                body: {
                    fileCode: '123456',
                    fileName: 'example.txt',
                    fileSize: 1024
                }
            };
            const res = {
                status: sinon.stub().returnsThis(),
                send: sinon.stub()
            };
            sinon.stub(File.prototype, 'save').rejects(new Error('Mocked error'));
            await FileAnalysisController.saveFile(req, res);
            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.send, {
                success: false,
                message: "Failed to save file"
            });
            console.log("saveFile test completed successfully");
            File.prototype.save.restore();
        });
    });

    describe('listAndCountUniqueWords', function () {
        it('should list and count unique words successfully', async function () {
            console.log("Running listAndCountUniqueWords test - should list and count unique words successfully");
            const req = {
                query: {
                    fileCode: '123456'
                }
            };
            const res = {
                send: sinon.stub()
            };
            sinon.stub(fileAnalyticsService, 'processFileAndCountUniqueWords').resolves(10);
            await FileAnalysisController.listAndCountUniqueWords(req, res);
            sinon.assert.calledWith(res.send, {
                success: true,
                uniqueWordCount: 10
            });
            console.log("listAndCountUniqueWords test completed successfully");
            fileAnalyticsService.processFileAndCountUniqueWords.restore();
        });

        it('should handle errors while listing and counting unique words', async function () {
            console.log("Running listAndCountUniqueWords test - should handle errors while listing and counting unique words");
            const req = {
                query: {
                    fileCode: '123456'
                }
            };
            const res = {
                status: sinon.stub().returnsThis(),
                send: sinon.stub()
            };
            sinon.stub(fileAnalyticsService, 'processFileAndCountUniqueWords').rejects(new Error('Mocked error'));
            await FileAnalysisController.listAndCountUniqueWords(req, res);
            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.send, {
                success: false,
                uniqueWordCount: null,
                error: 'Error: Mocked error'
            });
            console.log("listAndCountUniqueWords test completed successfully");
            fileAnalyticsService.processFileAndCountUniqueWords.restore();
        });
    });

    describe('countSynonyms', function () {
        it('should count synonyms successfully', async function () {
            console.log("Running countSynonyms test - should count synonyms successfully");
            const req = {
                body: {
                    fileCode: '123456',
                    words: ['word1', 'word2']
                }
            };
            const res = {
                send: sinon.stub()
            };
            sinon.stub(fileAnalyticsService, 'countSynonymsOfWords').resolves({ synonymCount: 5 });
            await FileAnalysisController.countSynonyms(req, res);
            sinon.assert.calledWith(res.send, { synonymCount: 5 });
            console.log("countSynonyms test completed successfully");
            fileAnalyticsService.countSynonymsOfWords.restore();
        });

        it('should handle errors while counting synonyms', async function () {
            console.log("Running countSynonyms test - should handle errors while counting synonyms");
            const req = {
                body: {
                    fileCode: '123456',
                    words: ['invalidWord'] // Invalid word to trigger an error
                }
            };
            const res = {
                status: sinon.stub().returnsThis(),
                send: sinon.stub()
            };
            const mError = new Error('network');
            sinon.stub(fileAnalyticsService, 'countSynonymsOfWords').rejects(mError);
            await FileAnalysisController.countSynonyms(req, res);
            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.send, {error : mError});
            fileAnalyticsService.countSynonymsOfWords.restore();
        });
    });

    describe('maskWords', function () {
        it('should handle errors while masking words', async function () {
            console.log("Running maskWords test - should handle errors while masking words");
            const req = {
                body: {
                    fileCode: '123456',
                    words: ['word1', 'word2']
                }
            };
            const res = {
                status: sinon.stub().returnsThis(),
                send: sinon.stub()
            };
            const mError = new Error('network');
            sinon.stub(fileAnalyticsService, 'maskWordsInFile').rejects(mError);
            await FileAnalysisController.maskWords(req, res);
            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.send, { error: mError });
            console.log("maskWords test completed successfully");
            fileAnalyticsService.maskWordsInFile.restore();
        });
    });
});
