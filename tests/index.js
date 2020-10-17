const server      = require("../server");
const querystring = require('querystring');
const chai        = require("chai");
const chaiHttp    = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);

describe('Server', () => {
  it("Should return 404 for '/' url path", done => {
    chai
      .request(server)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it("Should return 200 for '/feed' url path", done => {
    const params = {
      page: 1,
      pageSize: 10,
      sortField: 'title',
      order: 'asc',
      type: 'string'
    };
    chai
      .request(server)
      .get(`/feed?${querystring.stringify(params)}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("Should return 200 for '/config' url path", done => {
    chai
      .request(server)
      .get(`/config`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        console.log({res});
        expect(res.body).to.have.property('appTitle');
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
        done();
      });
  });

  it("Validate response expected from /feed url path", done => {
    const params = {
      page: 1,
      pageSize: 10,
      sortField: 'title',
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

  it("Search for the key `king`, should return 4 documents", done => {
    const params = {
      searchTerm: 'king',
      page: 1,
      pageSize: 10,
      sortField: 'title',
      order: 'asc',
      type: 'string'
    };
    chai
      .request(server)
      .get(`/feed?${querystring.stringify(params)}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.total).to.equal(4);
        done();
      });
  });

  it("Search return empty documents collection for invalid page i.e 100", done => {
    const params = {
      searchTerm: 'king',
      page: 100,
      pageSize: 10,
      sortField: 'title',
      order: 'asc',
      type: 'string'
    };
    chai
      .request(server)
      .get(`/feed?${querystring.stringify(params)}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.total).to.equal(4); // there are total 4 docs matching the search term `king`
        expect(res.body.documents).to.have.length(0);
        done();
      });
  });
});