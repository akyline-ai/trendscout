/**
 * Feature Flags Configuration
 *
 * Все фичи включены — полная версия платформы
 */

// Feature flags — все включены
export const features = {
  // ===== ОСНОВНЫЕ =====
  auth: true,                    // Login/Register
  googleOAuth: true,             // Google авторизация
  dashboard: true,               // Основной dashboard
  myVideos: true,                // Мои видео
  pricing: true,                 // Страница с ценами
  settings: true,                // Настройки
  privacyPolicy: true,           // Privacy Policy
  termsOfService: true,          // Terms of Service
  dataDelation: true,            // Удаление данных

  // ===== OAUTH ПЛАТФОРМ =====
  tiktokOAuth: true,             // TikTok подключение
  instagramOAuth: true,          // Instagram подключение
  youtubeOAuth: true,            // YouTube подключение

  // ===== ИНСТРУМЕНТЫ =====
  trendDiscovery: true,          // Apify поиск трендов
  competitors: true,             // Отслеживание конкурентов
  aiScripts: true,               // AI генерация скриптов
  aiWorkspace: true,             // AI чат
  workflowBuilder: true,         // Конструктор workflow
  deepAnalysis: true,            // CLIP анализ
  trending: true,                // Вирусные видео
  marketplace: true,             // Маркетплейс

  // ===== КОММУНИКАЦИИ =====
  telegram: true,                // Telegram интеграция
  discord: true,                 // Discord интеграция
};

// Хелпер для проверки фичи
export const isFeatureEnabled = (feature: keyof typeof features): boolean => {
  return features[feature];
};

// Список страниц для навигации
export const getEnabledPages = () => {
  return {
    dashboard: features.dashboard,
    myVideos: features.myVideos,
    pricing: features.pricing,
    settings: features.settings,
    discover: features.trendDiscovery,
    competitors: features.competitors,
    aiScripts: features.aiScripts,
    aiWorkspace: features.aiWorkspace,
    workflowBuilder: features.workflowBuilder,
    deepAnalysis: features.deepAnalysis,
    trending: features.trending,
    marketplace: features.marketplace,
  };
};
