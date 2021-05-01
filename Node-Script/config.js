const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  FCM_CREDENTIALS_PATH: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};
