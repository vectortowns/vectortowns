process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const loggerLibrary = require('../libraries/logger');
const expect = chai.expect;
const DOMParser = require('xmldom').DOMParser;
chai.use(chaiHttp);
var expectedFileName = undefined;

describe('Logger Integration Tests', () => {

    it('Get file names of log folder', (done) => {
        chai.request(server)
            .get('/log')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
                const doc = new DOMParser().parseFromString(res.res.text,"text/html");
                expectedFileName = doc.getElementById('file0').textContent;
                expect(expectedFileName).to.not.be.undefined;
                done();
        });
    });

    it('Get log of a file name', (done) => {
        chai.request(server)
            .get('/log/' + expectedFileName)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
                done();
        });
    });

});