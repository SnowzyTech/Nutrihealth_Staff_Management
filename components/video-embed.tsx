interface VideoEmbedProps {
  videoUrl: string;
  videoType: 'youtube' | 'vimeo' | 'external';
  title?: string;
  className?: string;
}

export function VideoEmbed({ videoUrl, videoType, title, className = '' }: VideoEmbedProps) {
  let embedUrl = videoUrl;
  let embedType = 'iframe';

  if (videoType === 'youtube') {
    const videoId = extractYoutubeId(videoUrl);
    embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
  } else if (videoType === 'vimeo') {
    const videoId = extractVimeoId(videoUrl);
    embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  return (
    <div className={`relative w-full bg-black rounded-lg overflow-hidden ${className}`}>
      <div style={{ paddingBottom: '56.25%' }} className="relative">
        <iframe
          src={embedUrl}
          title={title || 'Video player'}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function extractYoutubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : '';
}

function extractVimeoId(url: string): string {
  const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
  const match = url.match(regExp);
  return match ? match[5] : '';
}
