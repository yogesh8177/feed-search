const server      = require("../server");
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

  it("Should return 200 for '/feed' url path", done => {
    const params = {
      page: 1,
      pageSize: 10,
      sortField: 'name',
      order: 'asc',
      type: 'string'
    };
    chai
      .request(server)
      .get(`/feed?${querystring.stringify(params)}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('buildVersion');
        done();
      });
  });

  it("Should return 200 for '/config' url path", done => {
    chai
      .request(server)
      .get(`/config`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('appTitle');
        expect(res.body).to.have.property('buildVersion');
        done();
      });
  });

  it ("should return auto complete results for term `super`", done => {
    const expectedResults = [
      'superboy',
      'superboy-prime',
      'supergirl',
      'superman'
    ];

    chai
      .request(server)
      .get(`/auto-complete?autoComplete=super`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data').to.be.an('array');
        expect(res.body).to.have.property('buildVersion');
        console.log('ab@', res.body);
        expectedResults.forEach((result, index) => {
          expect(res.body.data[index]).equals(result);
        })
        done();
      });
  });

  it("Should return 200 for '/refresh' url path", done => {
    chai
      .request(server)
      .get(`/refresh`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('benchmark');
        expect(res.body).to.have.property('buildVersion');
        done();
      });
  });

  it("Validate response expected from /feed url path", done => {
    const params = {
      page: 1,
      pageSize: 10,
      sortField: 'name',
      order: 'asc',
      type: 'string'
    };
    chai
      .request(server)
      .get(`/feed?${querystring.stringify(params)}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('total');
        expect(res.body).to.have.property('documents');
        expect(res.body.documents).to.be.an('array');
        done();
      });
  });

  it("Search for the key `batman`, should return 3 documents", done => {
    const params = {
      searchTerm: 'batman',
      page: 1,
      pageSize: 10,
      sortField: 'name',
      order: 'asc',
      type: 'string'
    };
    chai
      .request(server)
      .get(`/feed?${querystring.stringify(params)}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.total).to.equal(3);
        done();
      });
  });

  it("Search return empty documents collection for invalid page i.e 1000", done => {
    const params = {
      searchTerm: 'batman',
      page: 100,
      pageSize: 10,
      sortField: 'name',
      order: 'asc',
      type: 'string'
    };
    chai
      .request(server)
      .get(`/feed?${querystring.stringify(params)}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.total).to.equal(3); // there are total 3 docs matching the search term `batman`
        expect(res.body.documents).to.have.length(0);
        done();
      });
  });
});