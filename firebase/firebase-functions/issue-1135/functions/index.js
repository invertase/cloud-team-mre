const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");

admin.initializeApp();

const region = process.env.FUNCTION_REGION || "us-central1";

exports.authUserBeforeCreate = functions
  .region(region)
  .auth.user()
  .beforeCreate((user, context) => {
    functions.logger.info("beforeCreate called", {
      uid: user.uid,
      email: user.email,
      eventId: context.eventId,
    });

    return {};
  });

exports.authUserBeforeSignIn = functions
  .region(region)
  .auth.user()
  .beforeSignIn(async (user, context) => {
    const response = {
      displayName: "Raging Tomato",
      customClaims: {
        fromBeforeSignIn: true,
      },
      sessionClaims: {
        signInIpAddress: context.ipAddress || "unknown",
      },
    };

    functions.logger.info("beforeSignIn returning response", {
      uid: user.uid,
      response,
    });

    return response;
  });
