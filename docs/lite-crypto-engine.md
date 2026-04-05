# Lite crypto engine

Implementación **real y determinista** del motor criptográfico de ssvault Lite en navegador.

## Stack criptográfico elegido

- **Argon2id**: [`hash-wasm`](https://www.npmjs.com/package/hash-wasm)
- **HKDF**: Web Crypto nativo (`SubtleCrypto`) con `HKDF` + `SHA-256`
- **Wordlist passphrase**: wordlist inglesa BIP39 desde `@scure/bip39/wordlists/english.js`

## Por qué esta elección

### Argon2id con `hash-wasm`

Se eligió `hash-wasm` porque:

- soporta **Argon2id** en navegador moderno y Node;
- no depende de backend;
- empaqueta WASM sin wiring manual de assets;
- tiene buena reputación y documentación pública;
- evita inventos ad hoc alrededor de primitivas críticas.

### Tradeoffs de `hash-wasm`

- En esta iteración se ejecuta preferentemente dentro de un **Web Worker** dedicado para evitar bloquear la UI.
- Si el Worker no existe o falla al inicializar/ejecutar, Lite degrada al hilo principal y lo comunica en UI/estado. NO hay fallo silencioso.
- `parallelism > 1` no aporta gran cosa en este contexto porque el runtime no está afinado aquí para multithreading real de navegador.
- El coste de Argon2id en cliente debe balancear seguridad con UX y dispositivos modestos.

## Capa de ejecución

- **`lite-derivation-core.ts`** concentra TODA la lógica criptográfica reutilizable: Argon2id, HKDF, password, passphrase y visual fingerprint.
- **`lite-derivation.worker.ts`** solo actúa como adaptador de mensajería. No duplica primitivas ni reglas de dominio.
- **`lite-derivation-engine.ts`** orquesta la estrategia `worker-first`, mantiene el estado del Worker durante la sesión y decide cuándo degradar al hilo principal.

### Tradeoffs de esta capa

- **Ventaja**: la UI se mantiene más responsiva cuando el navegador soporta Worker y WASM en ese contexto.
- **Ventaja**: el fallback sigue usando EXACTAMENTE el mismo núcleo criptográfico, así que no cambia ni el resultado ni el canonical ID.
- **Costo**: hay complejidad adicional de mensajería y manejo explícito de errores.
- **Costo**: si el Worker falla una vez en la sesión, el motor degrada de forma estable al hilo principal para evitar reintentos opacos y estados inconsistentes.

## Parámetros elegidos

### Argon2id

- Perfil `constrained`: **32 MiB**, `iterations=3`, `parallelism=1`, `hashLength=32`
- Perfil `balanced` (**default seguro**): **64 MiB**, `iterations=3`, `parallelism=1`, `hashLength=32`
- Perfil `strong`: **96 MiB**, `iterations=3`, `parallelism=1`, `hashLength=32`
- Perfil `max`: **128 MiB**, `iterations=4`, `parallelism=1`, `hashLength=32`

### Razonamiento

- **64 MiB / t=3** sigue siendo el punto de partida seguro cuando no hay señales fiables del entorno.
- `constrained` existe para dispositivos claramente modestos; NO pretende ser “mágico”, solo bajar presión de memoria cuando el navegador expone pistas muy conservadoras o la sesión demuestra demasiada latencia.
- `strong` y `max` aprovechan equipos más capaces sin tocar el contrato funcional Lite v1.
- **parallelism = 1** evita vender un paralelismo teórico que aquí no está realmente optimizado.
- **32 bytes** bastan como material raíz para luego separar contextos con HKDF-SHA-256.

## Calibración Argon2 seleccionable por el usuario

El nivel de calibración Argon2 **lo elige el usuario** en el formulario y forma parte del **canonical ID**. Esto garantiza determinismo cross-device: mismos inputs + mismo nivel de calibración = misma contraseña en cualquier dispositivo.

### Sugerencia automática inicial

Al abrir Lite por primera vez, el sistema sugiere un nivel basándose en señales del hardware:

- `navigator.hardwareConcurrency`
- `navigator.deviceMemory` cuando existe

**Mapa de sugerencia:**

- `hc <= 2` o `mem <= 2 GiB` → `constrained`
- `hc >= 12` y `mem >= 16 GiB` (o memoria no expuesta) → `max`
- `hc >= 8` y `mem >= 8 GiB` (o memoria no expuesta) → `strong`
- resto / sin señales fiables → `balanced` como **default seguro**

La sugerencia es solo el valor inicial del campo. El usuario puede cambiarlo libremente.

### Por qué es selección manual y no auto-adaptativa

En versiones anteriores del diseño, la calibración se ajustaba automáticamente tras medir el tiempo de cada derivación. Esto rompía la promesa fundamental de Lite: un móvil podía seleccionar `constrained` (32 MiB) mientras un PC seleccionaba `strong` (96 MiB), produciendo **contraseñas distintas para los mismos inputs**.

La solución es hacer que el nivel de calibración sea un parámetro explícito de la identidad de derivación, igual que el servicio, perfil o versión.

### Tradeoffs

- **Ventaja**: determinismo total cross-device. Mismo nivel = mismo resultado, siempre.
- **Ventaja**: el usuario tiene control explícito sobre el coste computacional.
- **Costo**: el usuario debe recordar (o guardar en un perfil) qué nivel usa. Los perfiles exportados incluyen esta información.
- **Costo**: un usuario en un dispositivo modesto podría elegir `max` y experimentar latencia alta. La UI muestra el nivel elegido y el hint recomienda consistencia entre dispositivos.

## Composición criptográfica

1. **Salt Argon2id determinista**
   - Se deriva de `SHA-256("ssvault-lite|argon2id-salt|v1|<canonicalId>")`
   - Se usan los primeros **16 bytes** como salt de Argon2id.

2. **Root key con Argon2id**
   - Entrada: master password normalizada con `NFKC` (sin `trim`, para no modificar secretos de forma destructiva)
   - Contexto: `canonicalId`

3. **Separación de contextos con HKDF-SHA-256**
   - `purpose=password`
   - `purpose=passphrase`
   - `purpose=visual`

Cada salida usa `info` distinto. Así evitamos reutilizar el mismo flujo de bytes entre password, passphrase y fingerprint visual.

## Política de generación

### Password mode

- Alfabeto base seguro sin caracteres ambiguos: `ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789`
- Símbolos opcionales: `!@#$%*+-_`
- El mapeo de bytes a charset usa **rejection sampling** para evitar sesgo módulo.

### Passphrase mode

- Se usa la **wordlist inglesa BIP39** de 2048 palabras.
- 2048 = `2^11`, así que cada palabra se obtiene con chunks de **11 bits** sin sesgo.
- El separador (`-`, `.`, etc.) es formato de salida, no identidad canónica.

## Visual fingerprint

El fingerprint visual se deriva con un contexto HKDF independiente y se muestra como:

- etiqueta corta legible (`adjective-noun`)
- paleta de 3 colores

### Límite importante

El fingerprint **NO** autentica nada y **NO** sustituye verificación criptográfica. Está diseñado con **baja entropía visible a propósito** para minimizar fuga de información mientras ofrece una comprobación humana rápida de consistencia.

## Límites actuales

- El fallback al hilo principal sigue pudiendo bloquear la UI en dispositivos lentos o navegadores sin Worker funcional.
- El usuario debe usar el mismo nivel de calibración en todos los dispositivos para obtener el mismo resultado. Los perfiles guardados y la exportación preservan esta información.
- No hay **auditoría externa** todavía.
- La passphrase usa **wordlist inglesa**; es una decisión pragmática por estandarización, no una optimización UX para todos los usuarios.
- Como Lite no persiste secretos ni salts aleatorias por credencial, el diseño usa **salt determinista ligada al canonical ID**. Eso es aceptable dentro del modelo local/stateless, pero conviene documentarlo con honestidad.
