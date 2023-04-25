require("dotenv").config();

const dev = {
    app: {
        serverPort: process.env.SERVER_PORT || 3001,
    },
    db: {
        url: process.env.MONGO_URL || "mongodb://127.0.0.1:27017/user-admin-db",
        jwtAccountActivationKey: process.env.JWT_ACCOUNT_ACTIVATION_KEY,
        smtpPassword: process.env.SMTP_PASSWORD,
        smtpUserName: process.env.SMTP_USERNAME,
        jwtAuthorizationKey: process.env.JWT_AUTHORIZATION_KEY,
    }
};
module.exports = dev;