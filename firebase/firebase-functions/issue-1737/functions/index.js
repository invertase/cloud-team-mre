import { onDocumentWritten } from "firebase-functions/v2/firestore";

// Sample v1 HTTP function
export const onWrite1737 = onDocumentWritten(
  {
    document: 'segments/{id}',
    timeoutSeconds: 3600,
  },
  async event => {
    console.log('test')
  }
)