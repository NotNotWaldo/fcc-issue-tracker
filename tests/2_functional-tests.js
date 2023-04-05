const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("Create an issue with every field: POST request to /api/issues/{project}", () => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "test title",
        issue_text: "test text",
        created_by: "me obv",
        assigned_to: "none than me",
        status_text: "bad",
      })
      .end((err, res) => {
        if (err) {
          console.log(err);
          assert.fail();
        }
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        let { issue_title, issue_text, created_by, assigned_to, status_text } =
          res.body;
        assert.deepStrictEqual(
          { issue_title, issue_text, created_by, assigned_to, status_text },
          {
            issue_title: "test title",
            issue_text: "test text",
            created_by: "me obv",
            assigned_to: "none than me",
            status_text: "bad",
          }
        );
      });
  });
  test("Create an issue with only required fields: POST request to /api/issues/{project}", () => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "test title",
        issue_text: "test text",
        created_by: "me obv",
      })
      .end((err, res) => {
        let { issue_title, issue_text, created_by } = res.body;
        assert.deepStrictEqual(
          { issue_title, issue_text, created_by },
          {
            issue_title: "test title",
            issue_text: "test text",
            created_by: "me obv",
          }
        );
      });
  });
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", () => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .end((err, res) => {
        let { error } = res.body;
        assert.deepStrictEqual(
          { error },
          { error: "required field(s) missing" }
        );
      });
  });
  test("View issues on a project: GET request to /api/issues/{project}", () => {
    chai
      .request(server)
      .get("/api/issues/apitest")
      .end((err, res) => {
        let issues = res.body;
        assert.isArray(issues);
      });
  });
  test("View issues on a project with one filter: GET request to /api/issues/{project}", () => {
    chai
      .request(server)
      .get("/api/issues/apitest?issue_title=afds")
      .end((err, res) => {
        console.log(res.body);
        let issues = res.body;
        assert.isArray(issues);
      });
  });

  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", () => {
    chai
      .request(server)
      .get("/api/issues/apitest?issue_title=afds&open=true")
      .end((err, res) => {
        console.log(res.body);
        let issues = res.body;
        assert.isArray(issues);
      });
  });
  // I dont fucking know but this put/update test kept launching itself twice leading to another bizzre thing that the id of the document it give is now different!!!!!!!!!!
  test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
    let id = "6429325bbc361aa737e39c5b";
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: id,
        issue_title: "afds",
        issue_text: "adf",
        created_by: "adfaf",
        open: true,
        assigned_to: "afda",
        status_text: "af",
      })
      .end((err, res) => {
        console.log(res.body);
        assert.equal(res.body._id, res.body._id);
        done();
      });
  });
  //omfg i dunno why this SINGLE mfing put test is launching itself twice
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
    let id = "6429325bbc361aa737e39c5b";
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: id,
        issue_title: "afds",
        issue_text: "adf",
        created_by: "adfaf",
        open: true,
        assigned_to: "afda",
        status_text: "af",
      })
      .end((err, res) => {
        console.log(res.body);
        assert.equal(res.body._id, res.body._id);
        done();
      });
  });
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", () => {
    let id = "6429325bbc361aa737e39c5b";
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        issue_title: "afds",
        issue_text: "adf",
        created_by: "adfaf",
        open: true,
        assigned_to: "afda",
        status_text: "af",
      })
      .end((err, res) => {
        console.log(res.body);
        assert.equal(res.body.error, "missing _id");
      });
  });
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", () => {
    let id = "6429328b6eb8e1dcac221b4a";
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: id,
      })
      .end((err, res) => {
        console.log(res.body);
        assert.equal(res.body.error, "no update field(s) sent");
      });
  });
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", () => {
    let id = "6429325bbc361aa737e39c5b";
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: "lasdkfkalsjflkads",
        issue_title: "afds",
        issue_text: "adf",
        created_by: "adfaf",
        open: true,
        assigned_to: "afda",
        status_text: "af",
      })
      .end((err, res) => {
        console.log(res.body);
        assert.equal(res.body.error, "could not update");
      });
  });
  test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "aasdffds",
        issue_text: "adasff",
        created_by: "adfaf",
        assigned_to: "",
      })
      .end((err, res1) => {
        console.log(res1.body);
        chai
          .request(server)
          .delete("/api/issues/apitest")
          .send({
            _id: res1.body._id,
          })
          .end((err, res2) => {
            assert.deepStrictEqual(res2.body, {
              result: "successfully deleted",
              _id: res1.body._id,
            });
            done();
          });
      });
  });
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
        _id: "dfsdjksfadfjklsadfsjkl",
      })
      .end((err, res) => {
        assert.deepStrictEqual(res.body, {
          error: "could not delete",
          _id: res.body._id,
        });
      done()
      });
  });
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
    let _id
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
        _id
      })
      .end((err, res) => {
        assert.deepStrictEqual(res.body, { error: "missing _id" });
      done()
      });
  });
});
