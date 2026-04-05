import type {
  LiteArgon2Calibration,
  LiteDerivedSecretPreview,
  LiteResolvedDerivationRequest,
} from '@shared/types/lite';

export interface LiteDerivationWorkerDeriveRequest {
  type: 'derive';
  requestId: string;
  payload: LiteResolvedDerivationRequest;
}

export interface LiteDerivationWorkerSuccessResponse {
  type: 'success';
  requestId: string;
  payload: {
    preview: LiteDerivedSecretPreview;
    calibration: LiteArgon2Calibration;
  };
}

export interface LiteDerivationWorkerErrorResponse {
  type: 'error';
  requestId: string;
  error: string;
}

export type LiteDerivationWorkerRequest = LiteDerivationWorkerDeriveRequest;
export type LiteDerivationWorkerResponse =
  | LiteDerivationWorkerSuccessResponse
  | LiteDerivationWorkerErrorResponse;
