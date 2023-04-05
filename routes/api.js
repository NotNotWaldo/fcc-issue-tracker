"use strict";
require("dotenv").config();
let uri = process.env.MONGO_URI;
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let issueSchema = mongoose.Schema({
  issue_title: {
    required: true,
    type: String,
  },
  issue_text: {
    required: true,
    type: String,
  }, 
  created_by: {
    required: true,
    type: String,
  },
  open: {
    type: Boolean,
    default: true,
  },
  assigned_to: String,
  created_on: {
    type: Date,
    default: new Date(),
  },
  updated_on: {
    type: Date,
    default: new Date(),
  },
  status_text: String,
});

module.exports = function (app) {
  app.use((req, res, next) => {
    console.log(
      `${req.method} ${req.path} with body of: ${JSON.stringify(req.body)}`
    );
    next();
  });

  app
    .route("/api/issues/:project")
    .all((req, res, next) => {
      let modelName = req.params.project;
      console.log(modelName);
      req.IssuesSubmission = mongoose.model(modelName, issueSchema);

      next();
    })
    .get(function (req, res) {
      let project = req.params.project;

      let filters = req.query;
      // if (filters.open) {
      //   console.log('this ran 3')
      //   filters.open = Boolean(filters.open)
      // }
      console.log(req.query);
      console.log("this ran");
      req.IssuesSubmission.find(filters).then((response) => {
        // console.log(response)
        res.send(response);
      });
    })

    .post(function (req, res) {
      let project = req.params.project;
      
      let { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }
      let Issue = req.IssuesSubmission;
      Issue.create({
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || ''
      }).then((response) => {
        // console.log(`res: ${JSON.stringify(response)}`)
        // console.log(response)
        res.json(response);
      });
    })

    .put(function (req, res) {
      let project = req.params.project;
      console.log(req.body);
      let { _id } = req.body;
      if (!_id) {
        return res.json({
          error: "missing _id",
        });
      }
      let updObj = { updated_on: new Date() };

      for (let filt in req.body) {
        if (req.body[filt] && filt != "_id") {
          console.log(`${filt}: ${req.body[filt]}`);
          updObj[filt] = req.body[filt];
        }
      }
      req.IssuesSubmission.findOne({ _id })
    
        .then((respond) => {
          if (!respond) {
            return res.json({
              error: 'could not update',
              _id
            })
          }
          if (Object.keys(updObj).length < 2) {
            return res.json({
              error: "no update field(s) sent",
              _id: req.body._id,
            });
          }

          console.log(updObj);
          req.IssuesSubmission.findOneAndUpdate(
            { _id },
            { $set: updObj },
            { new: true }
          )
            .then((response) => {
              // res.json(response)
              res.json({ result: "successfully updated", _id });
            })
            .catch((error) => {
              console.log("could not f ing update");
              return res.json({
                error: "could not update",
                _id: req.body._id,
              });
            });
        })
        .catch((error) => {
          console.log("could not f ing update");
          return res.json({
            error: "could not update",
            _id: req.body._id,
          });
        });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      let { _id } = req.body;
      if (!_id) {
        return res.json({
          error: "missing _id",
        });
      }
      req.IssuesSubmission.findOneAndDelete({ _id })
        .then((response) => {
          console.log(response._id);
          res.json({
            result: "successfully deleted",
            _id: response._id,
          });
        })
        .catch((err) => {
          res.json({
            error: "could not delete",
            _id: req.body._id,
          });
        });
    });
};
