"use strict";
const ObjectID = require("mongodb").ObjectId;

const {
   validParams,
   filterParams,
   convertToBoolean,
   filterNullandUndefined,
   filterEmptyStrings
} = require("../helpers");

module.exports = function (app, db) {
   app.route("/api/issues/:project")

      .get(function (req, res) {
         const { project } = req.params;

         // if open param is given, convert to boolean
         if (req.query.open) {
            req.query.open = convertToBoolean(req.query.open);
         }

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
         // set default values as empty string for optional params
         const {
            issue_title,
            issue_text,
            created_by = "",
            assigned_to = "",
            status_text = ""
         } = req.body;

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
               if (err) {
                  res.json({ error: err });
               } else {
                  const { project, ...returnData } = data;
                  res.json(returnData);
               }
            });
         }
      })

      .put(function (req, res) {
         const params = filterParams(req.body);
         const {
            _id,
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            open,
            status_text
         } = params;
         if (!_id) {
            res.json({ error: "missing _id" });
         } else if (Object.keys(filterEmptyStrings(params)).length <= 1) {
            res.json({ error: "no update field(s) sent", _id });
         } else {
            const date = new Date();

            const data = {
               issue_title,
               issue_text,
               updated_on: date,
               created_by,
               assigned_to,
               open: convertToBoolean(open),
               status_text
            };

            if (!ObjectID.isValid(_id)) {
               res.json({ error: "could not update", _id });
            } else {
               db.findOneAndUpdate(
                  // test for valid object id first
                  { _id: ObjectID(_id) },
                  { $set: filterNullandUndefined(data) },
                  { $upsert: false },
                  (error, data) => {
                     if (error) {
                        res.json({ error });
                     } else if (data.value === null) {
                        res.json({ error: "could not update", _id });
                     } else {
                        res.json({ result: "successfully updated", _id });
                     }
                  }
               );
            }
         }
      })

      .delete(function (req, res) {
         const { _id } = req.body;
         if (!_id) {
            res.json({ error: "missing _id" });
         } else if (!ObjectID.isValid(_id)) {
            res.json({ error: "could not delete", _id });
         } else {
            db.findOneAndDelete({ _id: ObjectID(_id) }, (error, data) => {
               if (error) {
                  res.json({ error });
               } else if (data.value === null) {
                  res.json({ error: "could not delete", _id });
               } else {
                  res.json({ result: "successfully deleted", _id });
               }
            });
         }
      });
};
