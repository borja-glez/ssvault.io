/// <reference lib="webworker" />

import { deriveLiteSecretPreviewWithMetadata } from '../domain/lite-derivation-core';
import type {
  LiteDerivationWorkerRequest,
  LiteDerivationWorkerResponse,
} from '../domain/lite-derivation-worker-protocol';

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<LiteDerivationWorkerRequest>) => {
  void (async () => {
    const message = event.data;

    if (message.type !== 'derive') {
      return;
    }

    try {
      const payload = await deriveLiteSecretPreviewWithMetadata(
        message.payload,
      );
      const response: LiteDerivationWorkerResponse = {
        type: 'success',
        requestId: message.requestId,
        payload,
      };

      workerScope.postMessage(response);
    } catch (error) {
      const response: LiteDerivationWorkerResponse = {
        type: 'error',
        requestId: message.requestId,
        error:
          error instanceof Error
            ? error.message
            : 'La derivación en Web Worker falló.',
      };

      workerScope.postMessage(response);
    }
  })();
};
