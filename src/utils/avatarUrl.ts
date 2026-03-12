/**
 * Utility function to get the correct avatar URL
 * Handles both relative and absolute URLs
 * In development, prepends backend URL for relative paths
 * In production, relative paths work since frontend and backend share same domain
 */
export const getAvatarUrl = (avatarUrl?: string): string => {
  if (!avatarUrl) {
    return 'https://i.pravatar.cc/150?img=1'; // Default avatar
  }

  // If it's already an absolute URL (starts with http:// or https://), return as-is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // If it's a relative URL (starts with /)
  if (avatarUrl.startsWith('/')) {
    // In development, we need to prepend the backend URL
    // In production, relative URLs work since they're on the same domain
    if (process.env.NODE_ENV === 'development') {
      // Get backend URL from environment or use default
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      return `${backendUrl}${avatarUrl}`;
    }
    
    // In production, return relative URL as-is
    return avatarUrl;
  }

  // If it's neither absolute nor relative (shouldn't happen), return as-is
  return avatarUrl;
};