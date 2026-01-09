/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    // Handle youtube.com/watch?v=ID
    if (url.includes('youtube.com/watch')) {
      const match = url.match(/[?&]v=([^&]+)/);
      return match?.[1] || null;
    }
    // Handle youtu.be/ID
    if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&]+)/);
      return match?.[1] || null;
    }
    // Handle youtube.com/embed/ID
    if (url.includes('youtube.com/embed/')) {
      const match = url.match(/embed\/([^?&]+)/);
      return match?.[1] || null;
    }
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
  }

  return null;
}

/**
 * Extract Vimeo video ID from Vimeo URL
 */
export function getVimeoVideoId(url: string): string | null {
  if (!url) return null;

  try {
    // Handle vimeo.com/ID or player.vimeo.com/video/ID
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return match?.[1] || null;
  } catch (error) {
    console.error('Error parsing Vimeo URL:', error);
  }

  return null;
}

/**
 * Determine the video type and return appropriate component props
 */
export function getVideoSource(url: string) {
  if (!url) return { type: 'none' };

  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return {
      type: 'youtube',
      id: youtubeId,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1`,
    };
  }

  const vimeoId = getVimeoVideoId(url);
  if (vimeoId) {
    return {
      type: 'vimeo',
      id: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?h=&autoplay=1&loop=1&muted=1&controls=0&title=false&byline=false&portrait=false`,
    };
  }

  // Assume it's a direct video file URL
  return {
    type: 'direct',
    url,
  };
}
