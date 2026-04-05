import type {
  LiteDerivedSecretResult,
  LiteResolvedDerivationRequest,
} from '@shared/types/lite';

/**
 * Contrato estable Lite v1.
 *
 * El motor recibe un request RESUELTO: identidad canónica cerrada + perfil +
 * opciones válidas por modo. Eso permite evolucionar la implementación
 * criptográfica sin reabrir el modelo funcional.
 */
export interface LiteDerivationEngine {
  derive(
    input: LiteResolvedDerivationRequest,
  ): Promise<LiteDerivedSecretResult>;
}
