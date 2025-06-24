import { onCall, onRequest } from "firebase-functions/v2/https";

export const issue_1557_req = onRequest({ cors: true, invoker: "public" }, (request, response) => {
	const data  = {
		isConnected: true,
		timestamp: new Date().getTime(),
	}
	response.json({ data })
})

export const issue_1557_call = onCall({ cors: true, invoker: "public" }, () => {
	const data  = {
		isConnected: true,
		timestamp: new Date().getTime(),
	}
  return data
})
