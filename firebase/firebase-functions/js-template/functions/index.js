import { onValueWritten } from "firebase-functions/v2/database";
import { logger } from "firebase-functions/logger";
import { database } from "firebase-functions/v1";

export const writeTransactionChangeV2 = onValueWritten(
    { ref: '/transactions/{groupId}/{entityId}'},
    event => {
        logger.info("AUTH-TEST v2", {
        authId: event.authId ?? null,
        authType: event.authType ?? null,
        rawAuthid: event["authid"] ?? null,
        rawAuthtype: event["authtype"] ?? null,
        instance: event.instance,
        firebaseDatabaseHost: event.firebaseDatabaseHost,
        params: event.params,
        eventId: event.id,
      });
    });
  
  export const writeTransactionChangeV1 = database
    .ref('/transactions/{groupId}/{entityId}')
    .onWrite((_change, context) => {
      logger.info('AUTH-TEST v1', {
        auth: context.auth ?? null,
        authType: context.authType ?? null,
        params: context.params,
        eventType: context.eventType,
        eventId: context.eventId,
      });
    });