"use strict";
const ObjectID = require("mongodb").ObjectId;

const validParams = require("../helpers").validParams;

module.exports = function (app, db) {
   app.route("/api/issues/:project")

      .get(function (req, res) {
         const { project } = req.params;
         const queries = Object.entries(req.query);

         // remove duplicate params and empty values
         queries.forEach((q) => {
            if (Array.isArray(q[1])) {
               q[1] = [...new Set(q[1])].filter((item) => item !== "");
               if (q[1].length === 0) {
                  q[1] = "";
               }
               if (q[1].length === 1) {
                  q[1] = q[1][0];
               }
               // if (q[0] === "_id" && ObjectID.isValid(q[1]))
            }
         });

         // remove invalid parameters
         const filteredQueries = Object.fromEntries(
            queries.filter((q) => validParams.includes(q[0]) && q[1] !== "")
         );

         // convert _id to db-friendly ObjectID
         console.log(filteredQueries)

         /* Left off trying to do databse search when multiple ofthe same param are given*/
         
                                       // for arrays of values
         db.find({project, status_text: {$in: ["nope", "ok"]}}).toArray((err, result) => {
            console.log(result)
         });
         res.sendStatus(301);
      })

      .post(function (req, res, next) {
         const { project } = req.params;
         const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

         // check all required fields have been entered
         if ([issue_text, issue_title, created_by].some((val) => !val)) {
            res.json({ error: "required field(s) missing" });
         } else {
            const date = new Date();
            db.insertOne(
               {
                  project,
                  issue_text,
                  issue_text,
                  created_by,
                  assigned_to,
                  status_text,
                  open: true,
                  created_on: date,
                  updated_on: date
               },
               (err, data) => {
                  if (err) console.log(err);
                  console.log(data);
               }
            );
         }
      })

      .put(function (req, res) {
         let project = req.params.project;
      })

      .delete(function (req, res) {
         let project = req.params.project;
      });
};
