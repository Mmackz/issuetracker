"use strict";

module.exports = function (app, db) {
   app.route("/api/issues/:project")

      .get(function (req, res) {
         const { project } = req.params;
      })

      .post(function (req, res, next) {
         const { project } = req.params;
         const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

         // check all required fields have been entered
         if ([issue_text, issue_title, created_by].some((val) => !val)) {
            res.json({ error: "required field(s) missing" });
         } else {
            const date = new Date()
            db.insertOne({
               project,
               issue_text,
               issue_text,
               created_by,
               assigned_to,
               status_text,
               open: true,
               created_on: date,
               updated_on: date
            }, (err, data) => {
               if (err) console.log(err);
               console.log(data)
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
