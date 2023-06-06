const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
require("../db-connection");
const { after } = require('mocha');

chai.use(chaiHttp);

let deleteID;
suite("Functional Tests", function () {
  suite("Routing Tests", function () {
    suite("3 Post request Tests", function () {
      test("Create an issue with every field: POST request to /api/issues/testproject", function (done) {
        this.timeout(50000);
        
      let testData = {
        issue_title: 'Test post issue with all fields',
        issue_text: 'Test post issue with all fields',
        created_by: 'Sofia',
        assigned_to: 'Idil',
        status_text: 'In progress'
      };

      chai
        .request(server)
        .post('/api/issues/testproject')
        .send(testData)
        .end(function (err, res) {
          if (err) throw err;
          deleteID = res.body._id;
          assert.deepInclude(res.body, testData);
          assert.property(res.body, 'created_on');
          assert.isNotNaN(Date.parse(res.body.created_on));
          assert.property(res.body, 'updated_on');
          assert.isNotNaN(Date.parse(res.body.updated_on));
          assert.property(res.body, 'open');
          assert.isTrue(res.body.open);
          assert.property(res.body, '_id');
          done();
        });
    });
  test('POST: Create an issue with only required fields', done => {
    let testData = {
      issue_title: 'Test post issue with only required fields',
      issue_text: 'Test post issue with only required fields',
      created_by: 'Sofia'
    };
    chai.request(server)
      .post('/api/issues/testproject')
      .send(testData)
      .end(function (err, res) {
        issueID = res.body._id;
        assert.include(res.body, testData);
        assert.property(res.body, 'created_on');
        assert.isNumber(Date.parse(res.body.created_on));
        assert.property(res.body, 'updated_on');
        assert.isNumber(Date.parse(res.body.updated_on));
        assert.property(res.body, 'open');
        assert.isTrue(res.body.open);
        assert.property(res.body, '_id');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.isEmpty(res.body.status_text);
        done();
      });
  });

  test('POST: Create an issue with missing required fields', done => {
    let testData = {
      created_by: 'Sofia'
    };
    chai.request(server)
      .post('/api/issues/testproject')
      .send(testData)
      .end(function (err, res) {
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
   });
 });  

suite("3 Get request Tests", function () {
test('GET: View issues on a project', done => {
 this.timeout(500000);

    chai.request(server)
      .get('/api/issues/testproject?')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
        assert.property(issue, 'issue_title');
        assert.property(issue, 'issue_text');
        assert.property(issue, 'created_by');
        assert.property(issue, 'assigned_to');
        assert.property(issue, 'status_text');
        assert.property(issue, 'open');
        assert.property(issue, 'created_on');
        assert.property(issue, 'updated_on');
        assert.property(issue, '_id');
        });
        done();
      });
  });

  
  test('GET: View issues on a project with one filter', done => {

    chai.request(server)
      .get('/api/issues/testproject?created_by=Sofia')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.created_by, 'Sofia');
        });
        done();
      });
    });
 
test('GET: View issues on a project with multiple filters', done => {
chai.request(server)
    .get('/api/issues/testproject?issue_title=Serious issue&issue_text=Check for issue')
    .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
        assert.equal(issue.issue_title, 'Serious issue');
        assert.equal(issue.issue_text, 'Check for issue');
        });
       done();
     });
   });
});  


suite("5 Put request Tests", function () {
test("Update one field on an issue: PUT request to /api/issues/testproject", function (done) {
this.timeout(500000);
let testData = { _id: '647fafb2a59c036d3639f88e', issue_title: 'test data' }; 
  chai
   .request(server)
   .put('/api/issues/testproject')
   .send(testData)
   .end(function (err, res) {
    assert.property(res.body, 'result');
    assert.equal(res.body.result, 'successfully updated');
    assert.equal(res.body._id, '647fafb2a59c036d3639f88e');
    done();
  });
});
test('Update multiple fields on an issue: PUT request to /api/issues/testproject', done => {
let testData = { _id: '647fad944c402d2bd99f9767', issue_title: 'Issue Title', issue_text: 'Text issue' };
  chai
     .request(server)
     .put('/api/issues/testproject')
     .send(testData)
     .end(function (err, res) {
      assert.property(res.body, 'result');
      assert.equal(res.body.result, 'successfully updated');
      assert.equal(res.body._id, '647fad944c402d2bd99f9767');
      done();
    });
});
test("Update an issue with missing _id: PUT request to /api/issues/test-data-put", function (done) {
    chai
       .request(server)
       .put("/api/issues/test-data-put")
       .send({
       issue_title: "Design Issue ",
       issue_text: "Issue",
      })
      .end(function (err, res) {
       assert.equal(res.status, 200);
       assert.equal(res.body.error, "missing _id");
      done();
    });
  });
test("Update an issue with no fields to update: PUT request to /api/issues/test-data-put", function (done) {
    chai
      .request(server)
      .put("/api/issues/test-data-put")
      .send({
        _id: " 647f49b2fb1044d6b9eb3bc9",
      })
      .end(function (err, res) {
       assert.equal(res.status, 200);
       assert.equal(res.body.error, "no update field(s) sent");
      done();
    });
  });
test("Update an issue with an invalid _id: PUT request to /api/issues/test-data-put", function (done) {
    chai
      .request(server)
      .put("/api/issues/test-data-put")
      .send({
        _id: "invalid _id",
        issue_title: "Design Issue",
        issue_text: "Issue",
      })
      .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.equal(res.body.error, "could not update");
      done();
     });
  });
});

suite("3 DELETE request Tests", function () {
 this.timeout(5000);

test('Delete an issue: DELETE request to /api/issues/testproject', done => {
  let testData = { _id: deleteID };
   chai
   .request(server)
   .delete('/api/issues/testproject')
   .send(testData)
   .end(function (err, res) {
   assert.equal(res.body.result, 'successfully deleted');
   assert.equal(res.body._id, deleteID);
 done();
 }); 
});
test('DELETE: Delete an issue with an invalid _id', done => {
  chai.request(server)
    .delete('/api/issues/apitest')
    .send({_id: 'updatedID'})
    .end(function (err, res) {
    assert.deepEqual(res.body, {error: 'could not delete', _id: 'updatedID'});
      done();
    });
});
test('DELETE: Delete an issue with missing _id', done => {
  chai.request(server)
    .delete('/api/issues/apitest')
    .send({})
    .end(function (err, res) {
      assert.deepEqual(res.body, {error: 'missing _id'});
      done();
     });
   });
  }); 
 });
});

after(function () {
  chai.request(server)
    .get('/');
});







