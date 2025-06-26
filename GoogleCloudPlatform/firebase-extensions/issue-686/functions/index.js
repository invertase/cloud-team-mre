import * as functions from "firebase-functions/v1";

// https://us-central1-dev-extensions-testing.cloudfunctions.net/appchecked_v1_call
export const appchecked_v1_call = functions.runWith({ enforceAppCheck: true }).https.onCall((request) => {
	console.log(request)

	return {
		isConnected: true,
		timestamp: new Date().getTime(),
	}
})

// https://us-central1-dev-extensions-testing.cloudfunctions.net/not_appchecked_v1_call
export const not_appchecked_v1_call = functions.https.onCall((request) => {
	console.log(request)

	return {
		isConnected: true,
		timestamp: new Date().getTime(),
	}
})
