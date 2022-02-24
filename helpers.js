exports.validParams = [
   "_id",
   "issue_text",
   "issue_text",
   "created_by",
   "assigned_to",
   "status_text",
   "open",
   "created_on",
   "updated_on"
];

exports.filterParams = function (params) {
   return Object.fromEntries(
      Object.entries(params).map((p) => {
         if (Array.isArray(p[1])) {
            return [p[0], p[1][0]];
         }
         return p;
      })
   );
};

exports.filterNullandUndefined = function (obj) {
   const entries = Object.entries(obj).filter(
      (arr) => arr[1] !== null && arr[1] !== undefined
   );
   return Object.fromEntries(entries);
};

exports.convertToBoolean = function (string) {
   if (string === "false") {
      return false;
   } else if (string === "true") {
      return true;
   }
   return null;
};
