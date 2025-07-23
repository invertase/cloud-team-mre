"use strict";
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();

exports.onAnalyticsEvent = functions.analytics.event("first_visit")
    .onLog(async (event) => {
      try {
        console.log(JSON.stringify(event));
      } catch (error) {
        console.error(error);
      }

      return null;
    });
