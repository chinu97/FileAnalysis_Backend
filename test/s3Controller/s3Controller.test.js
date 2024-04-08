const chai = require("chai");
const sinon = require("sinon");
const s3Controller = require('../../app/controllers/s3/s3');
const s3InteractionClient = require('../../app/services/s3InteractionClient/s3InteractionClient');
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME
const expect = chai.expect;

describe('S3 Controller', () => {
    describe('generatePresignedUrl', () => {
        it('should return a pre-signed URL', async () => {
            // Mock req and res objects
            const req = {
                query: {
                    fileName: 'example.txt',
                    fileCode: '123456'
                }
            };
            const res = {
                send: sinon.stub(),
                status: sinon.stub().returnsThis(),
                json: sinon.stub()
            };

            // Stub the S3 interaction client and its method
            const generatePresignedUploadUrlStub = sinon.stub(s3InteractionClient.prototype, 'generatePresignedUploadUrl');
            generatePresignedUploadUrlStub.withArgs(S3_BUCKET_NAME, 'example.txt_123456', 'text/plain').resolves('mocked-pre-signed-url');

            // Call the controller function
            await s3Controller.generatePresignedUrl(req, res);

            // Get the pre-signed URL from the response
            const preSignedUrl = res.send.firstCall.args[0]['pre-signed-url'];
            console.log('Pre-signed URL:', preSignedUrl);

            // Assertions
            expect(res.send.calledWith({ 'pre-signed-url': 'mocked-pre-signed-url' })).to.be.true;
            expect(res.status.called).to.be.false;
            expect(res.json.called).to.be.false;

            // Restore the stubs
            generatePresignedUploadUrlStub.restore();
        });

        it('should handle errors', async () => {
            // Mock req and res objects
            const req = {
                query: {
                    fileName: 'example.txt',
                    fileCode: '123456'
                }
            };
            const res = {
                send: sinon.stub(),
                status: sinon.stub().returnsThis(),
                json: sinon.stub()
            };

            // Stub the S3 interaction client and its method to throw an error
            const generatePresignedUploadUrlStub = sinon.stub(s3InteractionClient.prototype, 'generatePresignedUploadUrl');
            generatePresignedUploadUrlStub.rejects(new Error('Mocked error'));

            // Call the controller function
            await s3Controller.generatePresignedUrl(req, res);

            // Assertions
            expect(res.send.called).to.be.false;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ error: 'Failed to generate pre-signed URL' })).to.be.true;

            // Restore the stubs
            generatePresignedUploadUrlStub.restore();
        });
    });
});
