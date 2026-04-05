# Lite functional model v1

Este documento congela el **modelo funcional** de ssvault Lite antes de introducir criptografía real.

## 1. Canonical service identifier

Formato canónico:

```text
lite|svc=<service>|acct=<account|none>|ns=<namespace|none>|profile=<profileId>|cal=<calibrationProfileId>|mode=<mode>|v=<version>
```

### Entra en el ID canónico

- `service` — obligatorio
- `account` — opcional
- `namespace` — opcional
- `profileId` — obligatorio
- `calibrationProfileId` — obligatorio (`constrained` | `balanced` | `strong` | `max`)
- `mode` — obligatorio
- `version` — obligatoria, entero positivo

`balanced` es el valor inicial por defecto. La UI también puede autoajustar la calibración según el hardware, pero el nivel final siempre pasa a ser explícito y queda fijado en el canonical ID. Cambiar la calibración implica cambiar el resultado derivado.

### NO entra en el ID canónico

- `masterPassword`
- longitud concreta del password
- flag `includeSymbols`
- `wordCount` o `separator` de passphrase
- labels locales, timestamps o metadata de export/import
- cualquier material criptográfico futuro

### Normalización

- `NFKC`
- `trim`
- `lowercase`
- espacios y separadores comunes (`/`, `\`, `:`, `+`, `|`) → `-`
- caracteres no permitidos → `-`
- colapso de guiones repetidos
- fallback estable cuando el token queda vacío

## 2. Perfiles Lite

### `web`

- Modos soportados: `password`, `passphrase`
- Password: longitudes `[16, 20, 24, 32]`, default `20`, símbolos permitidos
- Passphrase: palabras `[4, 5, 6]`, separadores `-` y `.`

### `banking`

- Modos soportados: `password`
- Password: longitudes `[20, 24, 28, 32]`, default `24`
- Símbolos permitidos, pero desactivados por defecto
- Passphrase prohibida

### `legacy`

- Modos soportados: `password`
- Password: longitudes `[12, 16, 20]`, default `16`
- Símbolos prohibidos
- Passphrase prohibida

## 3. Reglas funcionales por modo

### `password`

Opciones válidas:

- `length`
- `includeSymbols`

Opciones no válidas:

- `wordCount`
- `separator`

### `passphrase`

Opciones válidas:

- `wordCount`
- `separator`

Opciones no válidas:

- `length`
- `includeSymbols`

## 4. Persistencia local

- `localStorage`: preferencias mínimas (`profileId`, `mode`, opciones por modo)
- `IndexedDB`: perfiles/configuración no secreta guardada, usando el `canonicalId` como `id`
- Nunca se persiste `masterPassword`

## 5. Export / import sin secretos

Envelope base:

```json
{
  "format": "ssvault-lite-config",
  "version": 1,
  "exportedAt": "ISO-8601",
  "preferences": { "...": "solo datos no secretos" },
  "profiles": [{ "...": "canonicalService + perfil/modo/opciones" }]
}
```

Incluye solo configuración reutilizable. Excluye secretos, derivaciones, seeds y futuros parámetros criptográficos.

## 6. Contrato de derivación

El motor criptográfico no recibe el formulario crudo. Recibe un request resuelto con:

- `canonicalService`
- `profile`
- `options` válidas para el modo
- `masterPassword` efímera

Eso permite evolucionar la implementación criptográfica sin reabrir el modelo funcional Lite v1.

La implementación actual usa Argon2id + HKDF-SHA-256 con Web Worker isolation. Ver [`lite-crypto-engine.md`](lite-crypto-engine.md) para detalles.
