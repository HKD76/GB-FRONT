// Configuration du logging
export const LOGGING_CONFIG = {
  // Niveau de log par défaut (ERROR, WARN, INFO, DEBUG)
  DEFAULT_LEVEL: 'INFO' as const,
  
  // Activer/désactiver les logs détaillés des calculs de stats
  ENABLE_DETAILED_STATS_LOGS: false,
  
  // Activer/désactiver les logs d'API
  ENABLE_API_LOGS: true,
  
  // Activer/désactiver les logs de navigation
  ENABLE_NAVIGATION_LOGS: false,
  
  // Activer/désactiver les logs de debug des composants
  ENABLE_COMPONENT_LOGS: false,
  
  // Activer/désactiver les logs de performance
  ENABLE_PERFORMANCE_LOGS: false,
};

// Fonction utilitaire pour vérifier si un type de log est activé
export const shouldLog = (type: keyof typeof LOGGING_CONFIG): boolean => {
  return LOGGING_CONFIG[type] === true;
};
