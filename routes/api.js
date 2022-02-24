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
               // convert id to db friendly object id
               if (q[0] === "_id") {
                  q[1] = q[1].map((id) => {
                     if (ObjectID.isValid(id)) {
                        return ObjectID(id);
                     }
                     return null;
                  });
               }

               q[1] = [...new Set(q[1])].filter((item) => item !== null);
               if (q[1].length === 0) {
                  q[1] = null;
               }

               if (q[1].length === 1) {
                  q[1] = q[1][0];
               }
            } else {
               if (q[0] === "_id" && ObjectID.isValid(q[1])) {
                  q[1] = ObjectID(q[1]);
               }
            }
            if (!Array.isArray(q[1]) && q[1] !== null) {
               q[1] = [q[1]];
            }
         });

         // remove invalid parameters and format for dbsearch
         const filteredQueries = Object.fromEntries(
            queries
               .filter((q) => validParams.includes(q[0]) && q[1] !== null)
               .map((q) => [q[0], { $in: q[1] }])
         );

         // build query seperately
         const query = {
            project,
            ...filteredQueries
         };

         // for arrays of values
         db.find(query)
            .project({ project: 0 })
            .toArray((err, result) => {
               if (err) {
                  res.json({ error: err });
               } else {
                  res.json(result);
               }
            });
      })

      .post(function (req, res, next) {
         const { project } = req.params;
         const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

         // check all required fields have been entered
         if ([issue_text, issue_title, created_by].some((val) => !val)) {
            res.json({ error: "required field(s) missing" });
         } else {
            const date = new Date();
            const data = {
               project,
               issue_title,
               issue_text,
               created_on: date,
               updated_on: date,
               created_by,
               assigned_to,
               open: true,
               status_text
            };
            db.insertOne(data, (err, result) => {
               if (err) console.log(err);
               const { project, ...returnData } = data;
               res.json(returnData);
            });
         }
      })

      .put(function (req, res) {
         let project = req.params.project;
      })

      .delete(function (req, res) {
         let project = req.params.project;
      });
};
