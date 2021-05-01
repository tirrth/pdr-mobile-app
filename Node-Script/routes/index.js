var express = require("express");
var router = express.Router();
var { google } = require("googleapis");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// router.get("/fcm/authorization", function (req, res, next) {
//   function getAccessToken() {
//     return new Promise(function (resolve, reject) {
//       const key = require("../service-account.json");
//       const jwtClient = new google.auth.JWT(
//         key.client_email,
//         null,
//         key.private_key,
//         ["https://www.googleapis.com/auth/firebase.messaging"], //  ----- OR ----- https://www.googleapis.com/auth/cloud-platform
//         null
//       );
//       jwtClient.authorize(function (err, tokens) {
//         if (err) {
//           reject(err);
//           return;
//         }
//         resolve(tokens);
//       });
//     });
//   }

//   getAccessToken()
//     .then((token_info) => {
//       console.log(token_info);
//       res.status(200).json(token_info);
//     })
//     .catch((err) => console.log(err));
// });

module.exports = router;
