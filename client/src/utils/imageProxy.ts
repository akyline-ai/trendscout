/**
 * Image Proxy Utility
 *
 * Wraps TikTok/Instagram CDN URLs in our backend proxy to bypass CORS and geo-restrictions.
 */

// Get backend URL from environment or default to localhost
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Check if URL is from geo-restricted TikTok CDN (EU/Asia)
 */
function isGeoRestrictedUrl(url: string): boolean {
  return url.includes('tiktokcdn-eu.com') || url.includes('tos-alisg');
}

/**
 * Wrap an image URL with our backend proxy to bypass CORS/geo-restrictions
 *
 * For geo-restricted URLs (EU/Asia CDN), uses our backend proxy with Apify residential IPs.
 * For US CDN URLs, uses backend proxy for CORS bypass only (faster).
 *
 * @param url - Original CDN URL from TikTok/Instagram
 * @returns Proxied URL through our backend
 */
export function proxyImageUrl(url: string | null | undefined): string {
  // If no URL, return placeholder
  if (!url) {
    return '/placeholder-avatar.svg';
  }

  // If already a local/relative URL, return as is
  if (url.startsWith('/') || url.startsWith('data:') || url.includes('localhost')) {
    return url;
  }

  // If it's already proxied, return as is
  if (url.includes('/proxy/image')) {
    return url;
  }

  // Use our backend proxy - it handles both CORS and geo-restrictions
  // Backend automatically uses Apify residential proxy for EU/Asia CDN
  // Note: BACKEND_URL includes /api, so we add /proxy/image (not /api/proxy/image)
  return `${BACKEND_URL}/proxy/image?url=${encodeURIComponent(url)}`;
}

/**
 * Proxy a video thumbnail URL
 */
export function proxyThumbnailUrl(url: string | null | undefined): string {
  return proxyImageUrl(url);
}

/**
 * Proxy an avatar URL
 */
export function proxyAvatarUrl(url: string | null | undefined): string {
  return proxyImageUrl(url);
}
