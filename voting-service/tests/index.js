const { server, shutDown }      = require("../index");
const querystring = require('querystring');
const chai        = require("chai");
const chaiHttp    = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);

const expectProperties = (testObject, propertiesToCheck) => {
  propertiesToCheck.forEach(key => {
    expect(testObject).to.have.property(key);
  });
};

describe('Server', () => {
  it("Should return buildVersion and status for '/' url path", done => {
    chai
      .request(server)
      .get("/")
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal('live');
        expect(res.body).to.have.property('buildVersion');
        done();
      });
  });

  it("should display healthy when we ping /test endpoint", done => {
    chai
      .request(server)
      .get('/test')
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expectProperties(res.body, ['message', 'buildVersion']);
        expect(res.body.message).to.equal('healthy');
        done();
      })
  });
  
  it("should cast vote for dummy data", done => {
    const payload = {
      voteeId: 1
    };
    chai
      .request(server)
      .post('/cast-vote')
      .send(payload)
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expectProperties(res.body, ['data', 'buildVersion']);
        expectProperties(res.body.data, ['voteeId', 'message']);
        done();
      });
  });

  it("should fetch votes for url /fetch-votes", done => {
    const voteeIds = '1,2';

    chai
      .request(server)
      .get(`/fetch-votes?voteeIds=${voteeIds}`)
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expectProperties(res.body, ['data', 'buildVersion']);
        expect(res.body.data).to.be.an('array');
        expectProperties(res.body.data[0], ['voteeId', 'count']);
        expect(res.body.data[1].count).to.equal(null);
        done();
      })
  });

  after(() => {
    shutDown();
  });

});