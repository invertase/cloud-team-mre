"use strict";
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();

exports.onAppRemoveEvent = functions.analytics.event("app_remove")
    .onLog(async (event) => {
      try {
        console.log(JSON.stringify(event));

        const API_ENDPOINT = "https://example.com/api/dummy-endpoint";
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log(responseData);
        } else {
          const errorText = await response.text();
          console.error(errorText);
        }
      } catch (error) {
        console.error(error);
      }

      return null;
    });
