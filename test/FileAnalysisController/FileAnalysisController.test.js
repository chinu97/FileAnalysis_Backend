"use strict";
const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const FileAnalysisController = require('../../app/controllers/file-analytics/file-analytics');
const File = require('../../app/models/file');
const fileAnalyticsService = require("../../app/services/file-analytics/file-analytics");

describe('File Controller', () => {
    describe('saveFile', () => {
        it('should save the file successfully', async () => {
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

        it('should handle errors while saving the file', async () => {
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

    describe('listAndCountUniqueWords', () => {
        it('should list and count unique words successfully', async () => {
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

        it('should handle errors while listing and counting unique words', async () => {
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

    describe('countSynonyms', () => {
        it('should count synonyms successfully', async () => {
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

        it('should handle errors while counting synonyms', async () => {
            console.log("Running countSynonyms test - should handle errors while counting synonyms");
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

            try {
                sinon.stub(fileAnalyticsService, 'countSynonymsOfWords').rejects(new Error('Mocked error'));
                await FileAnalysisController.countSynonyms(req, res);
                sinon.assert.calledWith(res.status, 500);
                sinon.assert.calledWith(res.send, { error: 'Error: Mocked error' });
                console.log("countSynonyms test completed successfully");
            } catch (error) {
                console.error('Error in countSynonyms test:', error);
                throw error; // Rethrow the error to fail the test
            } finally {
                fileAnalyticsService.countSynonymsOfWords.restore();
            }
        });

    });

    describe('maskWords', () => {
        it('should mask words successfully', async () => {
            console.log("Running maskWords test - should mask words successfully");
            const req = {
                body: {
                    fileCode: '123456',
                    words: ['word1', 'word2']
                }
            };
            const res = {};
            const mockServiceResponse = 'Masked file content';
            const mockWriteStream = {
                end: sinon.stub()
            };
            sinon.stub(fileAnalyticsService, 'maskWordsInFile').resolves(mockWriteStream);
            await FileAnalysisController.maskWords(req, res);
            expect(mockWriteStream.end.called).to.be.true;
            console.log("maskWords test completed successfully");
            fileAnalyticsService.maskWordsInFile.restore();
        });

        it('should handle errors while masking words', async () => {
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
            sinon.stub(fileAnalyticsService, 'maskWordsInFile').rejects(new Error('Mocked error'));
            await FileAnalysisController.maskWords(req, res);
            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.send, { error: 'Error: Mocked error' });
            console.log("maskWords test completed successfully");
            fileAnalyticsService.maskWordsInFile.restore();
        });
    });
});
