const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const admin = require("firebase-admin");
const FCM_CREDENTIALS = require("../placeholders/service-account.json");
const uuid = require("react-uuid");

admin.initializeApp({
  credential: admin.credential.cert(FCM_CREDENTIALS),
  // databaseURL: "https://pushnotification-6b99c.firebaseio.com", // Don't need this (databaseURL) credential as per this project's requirements
});
const db = admin.firestore();

router.get("/authorization", function (req, res, next) {
  function getAccessToken() {
    return new Promise(function (resolve, reject) {
      const jwtClient = new google.auth.JWT(
        FCM_CREDENTIALS.client_email,
        null,
        FCM_CREDENTIALS.private_key,
        ["https://www.googleapis.com/auth/firebase.messaging"], //  ----- OR ----- https://www.googleapis.com/auth/cloud-platform
        null
      );
      jwtClient.authorize(function (err, tokens) {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens);
      });
    });
  }

  getAccessToken()
    .then((token_info) => {
      res.status(200).json(token_info);
    })
    .catch((err) => res.status(err.status || 500).json(err));
});

const sendMulticast = async (req, res, next) => {
  let { users, notification_info: message } = req.body;
  const registrationTokens = Array.isArray(message.tokens)
    ? message.tokens
    : [];
  const notification_uuid = uuid();

  message.data = { ...message.data, notification_uuid };
  await admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      const failedTokens = [];
      // console.log(response);
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
      }

      const collection_name =
        users.is_merchant_account || users.is_merchant_account == "true"
          ? "sellers"
          : "buyers";

      Promise.all(
        users.uuid.map(async (user_uuid) => {
          const docRef = db.collection(collection_name).doc(user_uuid);
          await docRef.get().then((doc) => {
            if (doc.exists) {
              docRef
                .update({
                  messages: admin.firestore.FieldValue.arrayUnion({
                    // uuid: notification_uuid,
                    created_at: admin.firestore.Timestamp.now(),
                    data: message.data || null,
                    notification: message.notification || null,
                    is_seen: false,
                  }),
                })
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
            } else {
              docRef
                .set({
                  messages: admin.firestore.FieldValue.arrayUnion({
                    // uuid: notification_uuid,
                    created_at: admin.firestore.Timestamp.now(),
                    data: message.data || null,
                    notification: message.notification || null,
                    is_seen: false,
                  }),
                })
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
            }
          });
        })
      )
        .then(() => {
          failedTokens.map((failed_token) => {
            users.user_token_ref.map((user_info) => {
              if (
                Array.isArray(user_info.tokens) &&
                user_info.tokens.includes(failed_token)
              ) {
                const docRef = db
                  .collection(collection_name)
                  .doc(user_info.uuid);
                docRef
                  .update({
                    device_tokens: admin.firestore.FieldValue.arrayRemove(
                      failed_token
                    ),
                  })
                  .then((res) => () => null)
                  .catch((err) => () => null);
              }
            });
          });
          res.status(200).json({ ...response, failedTokens: failedTokens });
        })
        .catch((err) => {
          console.log(err);
          res.status(err.status || 500).json(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(err.status || 500).json(err);
    });
};

router.post("/send-notifications", function (req, res, next) {
  const users = req.body.users;
  let device_tokens = [];
  let user_token_ref = [];

  Promise.all(
    users.uuid.map(async (user_uuid) => {
      let collection_name = "";
      if (users.is_merchant_account || users.is_merchant_account == "true") {
        collection_name = "sellers";
      } else {
        collection_name = "buyers";
      }

      const docRef = db.collection(collection_name).doc(user_uuid);
      await docRef
        .get()
        .then((doc) => {
          if (doc.exists && Array.isArray(doc.data().device_tokens)) {
            device_tokens = [...device_tokens, ...doc.data().device_tokens];
            user_token_ref = [
              ...user_token_ref,
              { uuid: user_uuid, tokens: [...doc.data().device_tokens] },
            ];
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(err.status || 500).json(err);
        });
    })
  )
    .then(() => {
      if (device_tokens.length) {
        req.body.notification_info = {
          ...req.body.notification_info,
          tokens: [...device_tokens],
        };
        req.body.users.user_token_ref = user_token_ref;
        sendMulticast(req, res, next);
      } else {
        res.status(200).json({ error: { message: "User not found!" } });
        // res.status(400).json({ error: { message: "User not found!" } });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(err.status || 500).json(err);
    });
});

router.post("/send-multicast", function (req, res, next) {
  sendMulticast(req, res, next);
});

router.post("/web-hooks", function (req, res, next) {
  console.log(req.body);
  res.status(200).json(req.body);
});

router.get("/health-check", function (req, res, next) {
  console.log("Health Check UP");
  res.status(200).json("Health Check UP");
});

module.exports = router;
