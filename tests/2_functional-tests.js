const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
   suite("POST requests to /api/issues/{project}", function () {
      test("Create an issue with every field", function (done) {
         chai
            .request(server)
            .post("/api/issues/tests")
            .send({
               issue_title: "POST test",
               issue_text: "POST test text",
               created_by: "testing suite",
               assigned_to: "Mark",
               status_text: "Testing in progress.."
            })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.isObject(res.body);
               assert.exists(res.body._id);
               assert.equal(res.body.issue_title, "POST test");
               assert.equal(res.body.issue_text, "POST test text");
               assert.equal(res.body.created_by, "testing suite");
               assert.equal(res.body.assigned_to, "Mark");
               assert.equal(res.body.status_text, "Testing in progress..");
               assert.approximately(Date.parse(res.body.created_on), Date.now(), 500);
               assert.approximately(Date.parse(res.body.updated_on), Date.now(), 500);
               assert.isBoolean(res.body.open);
               assert.isTrue(res.body.open);
               done();
            });
      });

      test("Create an issue with only required fields", function (done) {
         chai
            .request(server)
            .post("/api/issues/tests")
            .send({
               issue_title: "POST test 2",
               issue_text: "required fields only",
               created_by: "testing suite"
            })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.isObject(res.body);
               assert.exists(res.body._id);
               assert.equal(res.body.issue_title, "POST test 2");
               assert.equal(res.body.issue_text, "required fields only");
               assert.equal(res.body.created_by, "testing suite");
               assert.equal(res.body.assigned_to, "");
               assert.equal(res.body.status_text, "");
               assert.approximately(Date.parse(res.body.created_on), Date.now(), 500);
               assert.approximately(Date.parse(res.body.updated_on), Date.now(), 500);
               assert.isBoolean(res.body.open);
               assert.isTrue(res.body.open);
               done();
            });
      });

      test("Create an issue with missing required fields", function (done) {
         chai
            .request(server)
            .post("/api/issues/tests")
            .send({
               issue_title: "POST test 3",
               issue_text: "required field missing",
               created_by: "",
               assigned_to: "Mary"
            })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.notExists(res.body._id);
               assert.isObject(res.body);
               assert.property(res.body, "error");
               assert.equal(res.body.error, "required field(s) missing");
               done();
            });
      });
   });

   suite("GET requests to /api/issues/{project}", function () {
      test("View issues on a project (no filter)", function (done) {
         chai
            .request(server)
            .get("/api/issues/tests")
            .end(function (err, res) {
               console.log(res.text);
            })
      })
   });
});
