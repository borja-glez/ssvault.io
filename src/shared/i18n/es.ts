import type { Translations } from './types';

export const es: Translations = {
  // ── Nav ────────────────────────────────────────────────
  nav: {
    vault: 'Vault',
    docs: 'Docs',
    details: 'Detalles',
  },

  // ── Footer ─────────────────────────────────────────────
  footer: {
    copyright: '© 2026 ssvault / lite',
  },

  // ── Index (Vault) ──────────────────────────────────────
  index: {
    title: 'ssvault Lite — Generador de credenciales',
    heroLine1: 'Una contraseña única',
    heroLine2: 'por cada servicio.',
    heroLine3: 'Sin almacenar nada.',
    heroSub1:
      'Escribe tu master password, indica el servicio y Lite deriva una',
    heroSub2:
      'credencial fuerte al instante. Nada se almacena, nada se sincroniza.',
    generatorSr: 'Generador Lite en tiempo real',
  },

  // ── Derivation Form ────────────────────────────────────
  form: {
    title: 'Parametros de Derivacion',
    masterPassword: 'Master password',
    masterPlaceholder: 'Introduce tu contrasena maestra',
    showPassword: 'Mostrar contrasena',
    hidePassword: 'Ocultar contrasena',
    service: 'Servicio',
    servicePlaceholder: 'github, gmail, aws...',
    account: 'Cuenta',
    accountPlaceholder: 'personal',
    namespace: 'Namespace',
    namespacePlaceholder: 'acme',
    profile: 'Perfil',
    profileHint:
      'Define longitudes, modos y simbolos segun el tipo de servicio',
    profileWeb: 'Web estandar',
    profileBanking: 'Banking / alta friccion',
    profileLegacy: 'Legacy / compatibilidad',
    version: 'Version',
    versionHint:
      'Incrementa para rotar la credencial sin cambiar la master password',
    mode: 'Modo',
    modeHint: 'Password genera caracteres; passphrase genera palabras BIP39',
    modePassword: 'Password',
    modePassphrase: 'Passphrase',
    length: 'Longitud',
    wordCount: 'Palabras',
    separator: 'Separador',
    separatorSpace: 'espacio',
    includeSymbols: 'Incluir simbolos',
    symbolsDisabled: 'Simbolos desactivados por politica',
    symbolsHint:
      'Caracteres como !@#$%^& aumentan la entropia de la contraseña',
    symbolsDisabledHint:
      'El perfil actual no permite simbolos por compatibilidad',
    calibration: 'Calibracion Argon2',
    calibrationHint:
      'Usa el mismo nivel en todos tus dispositivos para obtener el mismo resultado',
    calibrationAutoLabel: 'Sugerir segun hardware',
    reset: 'Reiniciar',
    saveProfile: 'Guardar perfil',
    saving: 'Guardando...',
  },

  // ── Result Panel ───────────────────────────────────────
  result: {
    label: 'RESULTADO',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    placeholder: 'Complete los campos para generar',
    copy: 'COPIAR CONTRASENA',
  },

  // ── Generator Status ───────────────────────────────────
  status: {
    label: 'ESTADO DEL GENERADOR',
    visualFingerprint: 'Visual fingerprint',
    runtime: 'Runtime',
    calibration: 'Calibracion',
    canonicalId: 'Canonical ID',
    detailsLink: 'Ver detalles de derivacion',
  },

  // ── Saved Profiles ────────────────────────────────────
  profiles: {
    label: 'PERFILES GUARDADOS',
    badge: 'solo metadatos',
    load: 'Cargar',
    delete: 'Eliminar',
    empty: 'Sin perfiles guardados',
    emptyHint:
      'Guarda una configuracion desde el formulario para acceder rapidamente.',
    mode: 'modo',
    length: 'longitud',
    words: 'palabras',
    symbols: 'simbolos',
  },

  // ── Docs page ──────────────────────────────────────────
  docs: {
    title: 'Documentación — ssvault Lite',
    heroLine1: 'Perfiles, rotación',
    heroLine2: 'y exportación sin secretos.',
    heroLine3: 'Todo en un vistazo.',
    heroSub1: 'Guía rápida para sacar el máximo partido a Lite: configuración,',
    heroSub2: 'recuperación determinista y preguntas frecuentes.',

    quickStartLabel: 'EMPEZAR RÁPIDO',
    quickStartTitle: 'Cómo usar Lite en menos de un minuto.',
    step1Title: 'Escribe tu master password.',
    step1Desc:
      'Es el secreto raíz del que se derivan todas las credenciales. Nunca se almacena.',
    step2Title: 'Define el servicio.',
    step2Desc:
      'El nombre del sitio o sistema (github, gmail, aws...). Junto a tu master password, es el dato mínimo para derivar.',
    step3Title: 'Ajusta perfil, versión y modo.',
    step3Desc:
      'Opcionalmente selecciona un perfil (web, banking, legacy), incrementa la versión para rotar, o elige entre password y passphrase.',
    step4Title: 'Copia el resultado.',
    step4Desc:
      'La credencial se genera en tiempo real. Cópiala y el portapapeles se intentará limpiar automáticamente a los 45 segundos.',
    quickStartNote:
      'Si guardas un perfil, solo se almacenan metadatos locales (servicio, modo, opciones). Nunca tu master password ni el resultado derivado.',

    profilesTitle: 'Perfiles',
    profilesDesc:
      'Cada perfil define qué modos, longitudes y opciones están disponibles. Guarda configuraciones no secretas para recargar entradas frecuentes sin volver a rellenar el formulario.',
    profileWebTitle: 'Web (estándar)',
    profileWebDesc:
      'Equilibrado para la mayoría de servicios. Soporta password (16-32 chars) y passphrase (4-6 palabras). Símbolos activados por defecto.',
    profileBankingTitle: 'Banking (alta fricción)',
    profileBankingDesc:
      'Conservador para accesos críticos. Solo password (20-32 chars), símbolos desactivados por defecto para reducir fricción con sistemas bancarios restrictivos.',
    profileLegacyTitle: 'Legacy (compatibilidad)',
    profileLegacyDesc:
      'Para sistemas antiguos con restricciones. Solo password (12-20 chars), sin símbolos. Minimiza rechazos.',

    rotationTitle: 'Rotación',
    rotationDesc1:
      'Usa el campo versión cuando necesites regenerar una credencial sin cambiar tu master password ni duplicar servicios.',
    rotationDesc2:
      'Incrementar la versión de 1 a 2 produce una credencial completamente diferente para el mismo servicio. El resultado anterior deja de ser accesible: no hay forma de recuperar la versión antigua a menos que vuelvas a poner la versión original.',
    rotationDesc3:
      'Esto es útil cuando un servicio te obliga a cambiar la contraseña periódicamente o cuando sospechas que una credencial ha sido comprometida.',

    exportLabel: 'EXPORTACIÓN E IMPORTACIÓN',
    exportTitle: 'Configuración portable sin secretos.',
    exportDesc:
      'Lite permite exportar tu configuración como un archivo JSON con formato',
    exportFormat: 'ssvault-lite-config',
    exportIncludes: 'v1. El archivo incluye:',
    exportItem1: 'Preferencias: perfil activo, modo, opciones de salida',
    exportItem2:
      'Perfiles guardados: servicio, cuenta, namespace, modo, versión',
    exportItem3: 'Timestamp de exportación',
    exportNever: 'Nunca se incluyen',
    exportNeverDesc:
      ': master password, resultados derivados ni material criptográfico.',
    exportImport:
      'Al importar en otro dispositivo, Lite reemplaza los perfiles locales por los del archivo y restaura las preferencias si están presentes. Solo necesitas recordar tu master password para regenerar los mismos resultados.',

    recoveryLabel: 'RECUPERACIÓN',
    recoveryTitle: 'Derivación determinista: mismos datos, mismo resultado.',
    recoveryDesc:
      'La derivación de Lite es completamente determinista. Si introduces los mismos parámetros en cualquier dispositivo obtendrás exactamente el mismo resultado:',
    recoveryFormula:
      'master password + servicio + cuenta + namespace + perfil + calibración Argon2 + modo + versión + opciones',
    recoveryResult: 'resultado idéntico',
    recoveryNoSync: 'no necesitas sincronización ni backup de secretos',
    recoveryExplain:
      '. Si pierdes acceso al dispositivo, solo necesitas recordar tu master password y los parámetros que usaste. Los perfiles exportados aceleran este proceso al restaurar los metadatos sin secretos.',
    recoveryWarning:
      'Contrapartida: si olvidas tu master password, no hay forma de recuperar ninguna credencial derivada. No existe reset, backup ni mecanismo de recuperación.',

    faqTitle: 'Preguntas comunes',
    faq1Q: '¿Qué guarda exactamente Lite?',
    faq1A:
      'Solo preferencias y perfiles no secretos: servicio, perfil, modo, versión y opciones de salida. Nunca la master password ni el resultado derivado. Las preferencias viven en localStorage y los perfiles en IndexedDB.',
    faq2Q: '¿Qué pasa si cambio de dispositivo?',
    faq2A:
      'Si repites master password, servicio, perfil, calibración Argon2, modo y versión, obtendrás el mismo resultado. Asegúrate de usar el mismo nivel de calibración en ambos dispositivos. Puedes exportar perfiles sin secretos para acelerar la configuración inicial en el nuevo dispositivo.',
    faq3Q: '¿Es seguro usar Lite en un equipo compartido?',
    faq3A:
      'Lite no persiste tu master password ni el resultado derivado. El portapapeles se intenta limpiar automáticamente a los 45 segundos. Sin embargo, un equipo compartido siempre conlleva riesgos: keyloggers, extensiones maliciosas o sesiones abiertas pueden exponer datos independientemente de Lite.',
    faq4Q: '¿Puedo exportar mi configuración?',
    faq4A:
      'Sí. El formato de exportación es ssvault-lite-config v1, un JSON con preferencias y perfiles guardados. Nunca incluye master passwords ni resultados derivados. Puedes importarlo en otro dispositivo para restaurar tu configuración sin secretos.',
    faq5Q: '¿Por qué no usar una bóveda tradicional?',
    faq5A:
      'Lite y una bóveda resuelven problemas distintos. Una bóveda almacena secretos cifrados que necesitan sincronización y backup. Lite no almacena nada: genera credenciales bajo demanda a partir de una fórmula determinista. No hay base de datos que proteger, sincronizar ni perder.',
    faq6Q: '¿Qué pasa si un servicio rechaza mi contraseña?',
    faq6A:
      'Prueba a cambiar el perfil o desactivar símbolos. El perfil Legacy está diseñado para sistemas con restricciones estrictas (solo alfanuméricos, longitudes cortas). Si el servicio tiene requisitos muy específicos, ajusta la longitud y los símbolos manualmente.',
    faq7Q: '¿Es Lite una alternativa a 2FA?',
    faq7A:
      'No. Lite genera contraseñas fuertes y únicas por servicio, pero no sustituye la autenticación de dos factores. Siempre activa 2FA donde esté disponible.',

    tocLabel: 'MAPA DE CONTENIDO',
    toc1: '01 · Uso rápido',
    toc2: '02 · Perfiles y rotación',
    toc3: '03 · Exportación sin secretos',
    toc4: '04 · Recuperación determinista',

    limitTitle: 'Límite importante',
    limitDesc:
      'Lite no es una bóveda. Está diseñada para derivar y recuperar credenciales, no para almacenar secretos arbitrarios ni sincronizar tu estado entre servidores. Si olvidas tu master password, no hay forma de recuperar nada.',

    nextLabel: 'SIGUIENTE LECTURA',
    nextDetails: 'Detalles técnicos',
    nextGenerator: 'Volver al generador',
  },

  // ── Detalles page ──────────────────────────────────────
  details: {
    title: 'Detalles técnicos — ssvault Lite',
    heroLine1: 'Argon2id, HKDF y Workers.',
    heroLine2: 'Decisiones criptográficas',
    heroLine3: 'sin humo.',
    heroSub1:
      'Cómo Lite deriva, aísla y calibra cada credencial. Contexto suficiente',
    heroSub2:
      'para auditar sin convertir la pantalla principal en documentación.',

    archLabel: 'ARQUITECTURA',
    archTitle: 'Pipeline de derivación Lite v1',
    archDesc:
      'Master password + canonical ID → Argon2id → root key → HKDF por contexto → password, passphrase y visual fingerprint. El resultado final nunca se persiste.',
    archSaltNote:
      'La sal de Argon2id es determinista (derivada del canonical ID) porque Lite no persiste secretos per-credential. HKDF separa contextos para que password, passphrase y visual fingerprint nunca reutilicen los mismos bytes.',

    step1Title: '01 · Identidad canónica',
    step1Desc:
      'Servicio, cuenta opcional, namespace, perfil, calibración Argon2, modo y versión forman el request estable sobre el que se deriva todo lo demás. Cada token se normaliza con NFKC, se pasa a lowercase y se limpian separadores (smart quotes, barras, dos puntos) para producir un ID determinista:',
    step1Fallbacks: 'Tokens vacíos usan fallbacks estables: servicio →',
    step1FallbackService: 'service',
    step1FallbackAccount: 'account',
    step1FallbackNs: 'default',
    step1FallbackEnd:
      '. Esto garantiza que el ID canónico siempre sea válido aunque el usuario deje campos opcionales vacíos.',

    step2Title: '02 · Aislamiento y calibración',
    step2Desc:
      'La derivación prioriza Web Worker para aislar la master password del hilo principal. Si el Worker no está disponible o falla, cae con honestidad al hilo principal reportando el motivo del fallback. No hay fallo silencioso. Lite parte de balanced como nivel por defecto y ofrece un botón para autoajustar según hardware, pero el nivel final lo fija el usuario en el formulario y forma parte del canonical ID.',
    step2CalibTitle: 'Niveles de calibración Argon2id',
    step2Hardware:
      'Balanced es el valor inicial por defecto. Si usas el botón de autoajuste, Lite recomienda un nivel según el hardware del dispositivo:',
    step2Low: '≤2 cores o ≤2 GiB',
    step2High: '≥12 cores + ≥16 GiB',
    step2Adaptive:
      '. El usuario puede cambiar el nivel en cualquier momento. OJO: cambiar la calibración cambia la contraseña o passphrase derivada. Para obtener el mismo resultado en distintos dispositivos, debe usarse el mismo nivel de calibración.',

    step3Title: '03 · Persistencia mínima',
    step3Desc:
      'Lite persiste lo mínimo necesario para una experiencia fluida sin comprometer secretos.',
    step3LocalStorage:
      'Preferencias mínimas: perfil activo, modo, opciones de password/passphrase. Se lee al montar el componente y se actualiza con debounce.',
    step3IndexedDB:
      'Perfiles guardados con su identificador canónico completo. Soporta CRUD (crear, leer, actualizar, eliminar) y reemplazo completo vía import.',
    step3Export:
      'Formato ssvault-lite-config v1. Envelope contract-first. Sanitización estricta al importar: cada perfil se valida individualmente y los inválidos se descartan en silencio.',
    step3Contract:
      'Toda operación de almacenamiento pasa por lite-storage-contract.ts que valida estructura, tipos y rangos antes de persistir. Datos fuera del contrato se rechazan o descartan.',

    step4Title: '04 · CSP y hardening',
    step4Desc:
      'Astro SSR aplica headers de seguridad vía middleware en cada respuesta. Las directivas CSP del servidor complementan los hashes per-page que Astro genera automáticamente para scripts y estilos.',

    paramsLabel: 'PARÁMETROS BASE',
    paramsDefault: 'El perfil por defecto es',
    paramsBalanced: 'balanced',
    paramsAdaptive:
      '. Balanced es el punto de partida por defecto. El botón de autoajuste puede cambiar el nivel según hardware, pero ese nivel pasa a formar parte de la derivación: mismo nivel = mismo resultado; nivel distinto = resultado distinto.',

    limitsTitle: 'Límites honestos',
    limitsDesc:
      'Sin backend, sin bóveda y sin sincronización remota. Lite resuelve derivación y recuperación; no pretende almacenar secretos arbitrarios ni reemplazar un vault completo.',
    limit1: 'Si olvidas la master password, no hay recuperación posible.',
    limit2: 'No hay backup automático de ningún dato.',
    limit3: 'El soporte de Web Worker depende del navegador y entorno.',
    limit4: 'La criptografía no ha sido auditada formalmente.',

    refLabel: 'REFERENCIA',
    refDocs: 'Documentación de uso',
    refGenerator: 'Volver al generador',
  },
};
