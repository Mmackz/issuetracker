const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const server = require("../server");
const { before, after } = require("mocha");

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
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.isArray(res.body, "body should be an array");
               assert.isObject(res.body[0], "response should contain JSON objects");
               done();
            });
      });

      test("View issues on a project (one filter)", function (done) {
         chai
            .request(server)
            .get("/api/issues/tests")
            .query({ assigned_to: "Mark" })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.isArray(res.body, "body should be an array");
               assert.isObject(res.body[0], "response should contain JSON objects");
               assert.isTrue(
                  res.body.every((val) => val.assigned_to === "Mark"),
                  "all projects should be assigned to Mark"
               );
               assert.isFalse(
                  res.body.every((val) => val.open === true),
                  "contains both open and closed issues"
               );
               done();
            });
      });

      test("View issues on a project (multiple filters)", function (done) {
         chai
            .request(server)
            .get("/api/issues/tests")
            .query({ assigned_to: "Mark", open: "true" })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.isArray(res.body, "body should be an array");
               assert.isObject(res.body[0], "response should contain JSON objects");
               assert.isTrue(
                  res.body.every((val) => val.assigned_to === "Mark"),
                  "all projects should be assigned to Mark"
               );
               assert.isTrue(
                  res.body.every((val) => val.open),
                  "contains only open issues"
               );
               done();
            });
      });
   });

   suite("PUT requests to /api/issues/{project}", function () {
      let id;

      before("does POST request before updating", function (done) {
         chai
            .request(server)
            .post("/api/issues/tests")
            .send({
               issue_title: "PUT testing",
               issue_text: "Testing PUT route",
               created_by: "before"
            })
            .end(function (err, res) {
               id = res.body._id;
               done();
            });
      });

      test("Update one field on an issue", function (done) {
         chai
            .request(server)
            .put("/api/issues/tests")
            .send({ _id: id, open: "false" })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.notExists(res.body.error, "error should not exist");
               assert.equal(res.body._id, id, `id:${id} should match _id:${res.body._id}`);
               assert.exists(res.body.result, "result parameter exists");
               assert.equal(
                  res.body.result,
                  "successfully updated",
                  "message should say successfully updated"
               );
               done();
            });
      });

      test("Update multiple fields on an issue", function (done) {
         chai
            .request(server)
            .put("/api/issues/tests")
            .send({
               _id: id,
               status_text: "In progress",
               assigned_to: "someone else",
               issue_text: "making changes"
            })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.notExists(res.body.error, "error should not exist");
               assert.exists(res.body._id, "_id should exist");
               assert.equal(res.body._id, id, `id:${id} should match _id:${res.body._id}`);
               assert.exists(res.body.result, "result parameter exists");
               assert.equal(
                  res.body.result,
                  "successfully updated",
                  "message should say successfully updated"
               );
               done();
            });
      });

      test("Update an issue with missing _id", function (done) {
         chai
            .request(server)
            .put("/api/issues/tests")
            .send({
               status_text: "In progress",
               assigned_to: "someone else",
               issue_text: "making changes"
            })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.exists(res.body.error, "error should exist");
               assert.notExists(res.body._id, "_id should not exist");
               assert.notExists(res.body.result, "result should not exist");
               assert.equal(
                  res.body.error,
                  "missing _id",
                  "error message for missing id shown"
               );
               done();
            });
      });

      test("Update an issue with no fields to update", function (done) {
         chai
            .request(server)
            .put("/api/issues/tests")
            .send({ _id: id })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.exists(res.body.error, "error should exist");
               assert.exists(res.body._id, "_id should exist");
               assert.equal(res.body._id, id, `id:${id} should match _id:${res.body._id}`);
               assert.equal(
                  res.body.error,
                  "no update field(s) sent",
                  "error message for missing fields shown"
               );
               done();
            });
      });

      test("Update an issue with an invalid _id", function (done) {
         chai
            .request(server)
            .put("/api/issues/tests")
            .send({ _id: "invalidID", open: "false" })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.exists(res.body.error, "error should exist");
               assert.exists(res.body._id, "_id should exist");
               assert.equal(res.body._id, "invalidID", `id should equal "invalidID`);
               assert.equal(
                  res.body.error,
                  "could not update",
                  "error message shown for invalid id"
               );
               done();
            });
      });

      after("Deletes db entry after tests", function (done) {
         chai
            .request(server)
            .delete("/api/issues/tests")
            .send({ _id: id })
            .end(function (err, res) {
               done();
            });
      });
   });

   suite("DELETE request to /api/issues/{project}", function () {
      let id;

      before("Make POST request to create new issue for testing", function (done) {
         chai
            .request(server)
            .post("/api/issues/tests")
            .send({
               issue_title: "For Deletion",
               issue_text: "will be deleted",
               created_by: "issue_tracker",
               status_text: "on queue for deletion"
            })
            .end(function (err, res) {
               id = res.body._id;
               done();
            });
      });

      test("Delete an issue", function (done) {
         chai
            .request(server)
            .delete("/api/issues/tests")
            .send({ _id: id })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.notExists(res.body.error, "error should not exist");
               assert.exists(res.body._id, "_id should exist");
               assert.equal(res.body._id, id, `id:${id} should match _id:${res.body._id}`);
               assert.exists(res.body.result, "result should exist");
               assert.equal(res.body.result, "successfully deleted");
               done();
            });
      });

      test("Delete an issue with an invalid _id", function (done) {
         chai
            .request(server)
            .delete("/api/issues/tests")
            .send({ _id: "invalidID" })
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.exists(res.body.error, "error should exist");
               assert.equal(res.body.error, "could not delete");
               assert.exists(res.body._id, "_id should exist");
               assert.equal(res.body._id, "invalidID", `id should equal "invalidID`);
               assert.notExists(res.body.result, "result should not exist");
               done();
            });
      });

      test("Delete an issue with missing _id", function (done) {
         chai
            .request(server)
            .delete("/api/issues/tests")
            .end(function (err, res) {
               expect(err).to.be.null;
               expect(res).to.have.status(200);
               assert.exists(res.body.error, "error should exist");
               assert.equal(res.body.error, "missing _id");
               assert.notExists(res.body._id, "_id should not exist");
               assert.notExists(res.body.result, "result should not exist");
               done();
            });
      });
   });
});
