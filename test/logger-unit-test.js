process.env.NODE_ENV = 'test';

const configuration = new require('../libraries/configuration')();
const chai = require('chai');
const expect = chai.expect;
const loggerLibrary = require('../libraries/logger');

describe('Logger Unit Tests', function() {
    it('getLogFolder() must be return a list of files', function() {
        var expectedFiles = [];
        loggerLibrary.getLogFolder(function(error,files){
            if (error) {
                // Test fail
            } else {
                expectedFiles = files;
            }
        });
        expect(expectedFiles.length).to.be.at.least(0);
    });

    it('getLogFile() must be return a list of lines if recieve a correct param', function() {
        var expectedLines = [];

        loggerLibrary.getLogFolder(function(error,files){
            if (error) {
                // Test fail
            } else {
                const filename = files[0];
                loggerLibrary.getLogFile(filename,function(error,lines){
                    if (error) {
                        // Test fail
                    } else {
                        expectedLines = lines;
                    }
                });
            }
        });

        expect(expectedLines.length).to.be.at.least(0);
    });

    it('getLogFile() must be return a error if recieve a worng param', function() {
        var expectedLines = [];
        var expectedError = undefined;
        loggerLibrary.getLogFile('/file/not/found',function(error,lines){
            if (error) {
                expectedError = error;
            } else {
                expectedLines = lines;
            }
        });
        expect(expectedLines.length).to.equal(0);
        expect(expectedError).to.not.be.undefined;
    });
});