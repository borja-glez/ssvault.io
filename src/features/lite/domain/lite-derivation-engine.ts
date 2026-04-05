import type {
  LiteDerivedSecretPreview,
  LiteDerivedSecretResult,
  LiteResolvedDerivationRequest,
} from '@shared/types/lite';
import type { LiteDerivationEngine } from './contracts';
import { deriveLiteSecretPreviewWithMetadata } from './lite-derivation-core';
import type { LiteDerivationWorkerResponse } from './lite-derivation-worker-protocol';
import LiteDerivationWorker from '../workers/lite-derivation.worker?worker';

type PendingWorkerRequest = {
  resolve: (payload: {
    preview: LiteDerivedSecretPreview;
    calibration: LiteDerivedSecretResult['execution']['calibration'];
  }) => void;
  reject: (error: Error) => void;
};

type WorkerStatus =
  | { kind: 'ready' }
  | { kind: 'unsupported'; reason: string }
  | { kind: 'failed'; reason: string };

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatCalibrationForMessage(
  calibration: LiteDerivedSecretResult['execution']['calibration'],
) {
  const memoryMiB = calibration.parameters.memorySize / 1024;
  return `${calibration.label} (${memoryMiB} MiB · t=${calibration.parameters.iterations} · p=${calibration.parameters.parallelism})`;
}

class AdaptiveLiteDerivationEngine implements LiteDerivationEngine {
  private requestSequence = 0;
  private worker: Worker | null = null;
  private workerStatus: WorkerStatus = { kind: 'ready' };
  private pendingRequests = new Map<string, PendingWorkerRequest>();

  async derive(
    input: LiteResolvedDerivationRequest,
  ): Promise<LiteDerivedSecretResult> {
    const workerResult = await this.tryDeriveInWorker(input);

    if (workerResult) {
      return workerResult;
    }

    const { preview, calibration } =
      await deriveLiteSecretPreviewWithMetadata(input);
    const reason =
      this.workerStatus.kind === 'ready'
        ? 'Web Worker no disponible en este entorno.'
        : this.workerStatus.reason;

    return {
      preview,
      execution: {
        runtime: 'main-thread',
        isolated: false,
        calibration,
        message: `Derivación ejecutada en hilo principal con perfil Argon2id ${formatCalibrationForMessage(calibration)}. ${reason}`,
        fallbackReason: reason,
      },
    };
  }

  private async tryDeriveInWorker(input: LiteResolvedDerivationRequest) {
    if (typeof window === 'undefined') {
      this.workerStatus = {
        kind: 'unsupported',
        reason: 'SSR no ejecuta la derivación en Web Worker.',
      };
      return null;
    }

    if (typeof Worker !== 'function') {
      this.workerStatus = {
        kind: 'unsupported',
        reason: 'Este navegador no expone la API de Web Worker.',
      };
      return null;
    }

    if (this.workerStatus.kind !== 'ready') {
      return null;
    }

    try {
      const { preview, calibration } = await this.deriveWithWorker(input);

      return {
        preview,
        execution: {
          runtime: 'worker',
          isolated: true,
          calibration,
          message: `Derivación aislada en Web Worker con perfil Argon2id ${formatCalibrationForMessage(calibration)}.`,
        },
      } satisfies LiteDerivedSecretResult;
    } catch (error) {
      const reason = toErrorMessage(
        error,
        'El Web Worker falló durante la derivación.',
      );
      this.workerStatus = { kind: 'failed', reason };
      this.disposeWorker();
      return null;
    }
  }

  private deriveWithWorker(input: LiteResolvedDerivationRequest) {
    const worker = this.ensureWorker();

    return new Promise<{
      preview: LiteDerivedSecretPreview;
      calibration: LiteDerivedSecretResult['execution']['calibration'];
    }>((resolve, reject) => {
      const requestId = `lite-derive-${++this.requestSequence}`;
      this.pendingRequests.set(requestId, { resolve, reject });
      worker.postMessage({
        type: 'derive',
        requestId,
        payload: input,
      });
    });
  }

  private ensureWorker() {
    if (this.worker) {
      return this.worker;
    }

    try {
      const worker = new LiteDerivationWorker();
      worker.onmessage = this.handleWorkerMessage;
      worker.onerror = this.handleWorkerError;
      this.worker = worker;
      return worker;
    } catch (error) {
      throw new Error(
        `No se pudo inicializar el Web Worker de derivación: ${toErrorMessage(error, 'error desconocido')}`,
        {
          cause: error,
        },
      );
    }
  }

  private handleWorkerMessage = (
    event: MessageEvent<LiteDerivationWorkerResponse>,
  ) => {
    const message = event.data;
    const pendingRequest = this.pendingRequests.get(message.requestId);

    if (!pendingRequest) {
      return;
    }

    this.pendingRequests.delete(message.requestId);

    if (message.type === 'success') {
      pendingRequest.resolve(message.payload);
      return;
    }

    pendingRequest.reject(new Error(message.error));
  };

  private handleWorkerError = (event: ErrorEvent) => {
    const reason =
      event.message || 'El Web Worker emitió un error no recuperable.';
    this.workerStatus = { kind: 'failed', reason };
    this.failPendingRequests(new Error(reason));
    this.disposeWorker();
  };

  private failPendingRequests(error: Error) {
    for (const { reject } of this.pendingRequests.values()) {
      reject(error);
    }

    this.pendingRequests.clear();
  }

  private disposeWorker() {
    if (!this.worker) {
      return;
    }

    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.worker.terminate();
    this.worker = null;
  }
}

export const liteDerivationEngine = new AdaptiveLiteDerivationEngine();
