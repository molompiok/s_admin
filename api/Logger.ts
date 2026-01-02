// logger.ts (pour le frontend)

const LOG_LEVELS = {
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    SILENT: 5,
};

// Détermine le niveau de log actuel
const currentLogLevel = process.env.NODE_ENV === 'production'
    ? LOG_LEVELS.INFO // Log INFO et au-dessus en production
    : LOG_LEVELS.DEBUG; // Log DEBUG et au-dessus en développement

const logger = {
    debug: (...args: any[]) => {
        if (currentLogLevel <= LOG_LEVELS.DEBUG) {
            console.debug('[DEBUG]', ...args);
        }
    },
    info: (...args: any[]) => {
        if (currentLogLevel <= LOG_LEVELS.INFO) {
            console.info('[INFO]', ...args);
        }
    },
    warn: (...args: any[]) => {
        if (currentLogLevel <= LOG_LEVELS.WARN) {
            console.warn('[WARN]', ...args);
        }
    },
    error: (message: string | Error, ...optionalParams: any[]) => {
        if (currentLogLevel <= LOG_LEVELS.ERROR) {
            console.error('[ERROR]', message, ...optionalParams);
            // En production, vous pourriez envoyer cette erreur à un service de monitoring
            // if (process.env.NODE_ENV === 'production') {
            //   sendErrorToMonitoringService(message, optionalParams);
            // }
        }
    },
};

export default logger;
