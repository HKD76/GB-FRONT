import { LOGGING_CONFIG } from "../config/logging";

// Système de logging centralisé
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

class Logger {
  private static instance: Logger;
  private logLevel: number = LOG_LEVELS[LOGGING_CONFIG.DEFAULT_LEVEL];
  private isDevelopment: boolean = __DEV__;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = LOG_LEVELS[level];
  }

  private shouldLog(level: number): boolean {
    return this.isDevelopment && level <= this.logLevel;
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      // console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      // console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      // console.log(`[INFO] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      // console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  // Méthodes spécialisées pour les stats
  weaponStats(
    weaponName: string,
    element: string,
    level: number,
    skills: number
  ) {
    this.info(
      `Weapon: ${weaponName} (${element}) Lv.${level} - ${skills} skills`
    );
  }

  summonStats(summonName: string, element: string, level: number) {
    this.info(`Summon: ${summonName} (${element}) Lv.${level}`);
  }

  totalStats(atk: number, hp: number) {
    this.info(
      `Total Stats: ATK=${atk.toLocaleString()}, HP=${hp.toLocaleString()}`
    );
  }

  skillCalculation(skillName: string, value: string, type: string) {
    if (LOGGING_CONFIG.ENABLE_DETAILED_STATS_LOGS) {
      this.debug(`Skill: ${skillName} = ${value} (${type})`);
    }
  }

  // Méthodes pour les erreurs courantes
  apiError(endpoint: string, error: any) {
    if (LOGGING_CONFIG.ENABLE_API_LOGS) {
      this.error(`API Error (${endpoint}):`, error.message || error);
    }
  }

  dataError(operation: string, error: any) {
    this.error(`Data Error (${operation}):`, error.message || error);
  }

  // Méthodes spécialisées pour différents types de logs
  navigation(from: string, to: string) {
    if (LOGGING_CONFIG.ENABLE_NAVIGATION_LOGS) {
      this.debug(`Navigation: ${from} → ${to}`);
    }
  }

  componentLifecycle(component: string, action: string) {
    if (LOGGING_CONFIG.ENABLE_COMPONENT_LOGS) {
      this.debug(`Component ${component}: ${action}`);
    }
  }

  performance(operation: string, duration: number) {
    if (LOGGING_CONFIG.ENABLE_PERFORMANCE_LOGS) {
      this.debug(`Performance: ${operation} took ${duration}ms`);
    }
  }
}

export const logger = Logger.getInstance();
