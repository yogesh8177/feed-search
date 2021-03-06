import { server }  from "../app";
import * as querystring from 'querystring';
import chai from "chai";
import chaiHttp from "chai-http";

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

  it("Should return 200 for '/live-match' url path", done => {
    chai
      .request(server)
      .get(`/live-match`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('title');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('buildVersion');
        done();
      });
  });

  it ("should return auto complete results for term `super`", done => {
    const expectedResults = [
      {
        word: "superboy",
        extraFields: "DC Comics"
      },
      {
        word: "superboy-prime",
        extraFields: "DC Comics"
      },
      {
        word: "supergirl",
        extraFields: "DC Comics"
      },
      {
        word: "superman",
        extraFields: "Superman Prime One-Million"
      }
    ];

    chai
      .request(server)
      .get(`/auto-complete?autoComplete=super`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data').to.be.an('array');
        expect(res.body).to.have.property('buildVersion');
        expectedResults.forEach((result, index) => {
          expect(res.body.data[index].word).equals(result.word);
          expect(res.body.data[index].extraFields).equals(result.extraFields);
        })
        done();
      });
  });

  it("Should return 200 for '/refresh' url path", done => {
    chai
      .request(server)
      .get(`/refresh`)
      .end((err, res) => {
        console.log(`refresh result`, res.body);
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

  it('Should return 200 for /blog url', done => {
    const responseProperties = [
      'title',
      'titleImage',
      'content',
      'buildVersion'
    ];
    chai
      .request(server)
      .get('/blog?slug=dummy')
      .end((err, res) => {
        expect(res).to.have.status(200);
        responseProperties.forEach(key => {
          expect(res.body).to.have.property(key);
        });
        done();
      });
  })
});
