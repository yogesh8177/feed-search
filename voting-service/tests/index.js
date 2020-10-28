const server      = require("../index");
const querystring = require('querystring');
const chai        = require("chai");
const chaiHttp    = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);

describe('Server', () => {
  it("Should return buildVersion and status for '/' url path", done => {
    chai
      .request(server)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal('live');
        expect(res.body).to.have.property('buildVersion');
        done();
      });
  });
  
});