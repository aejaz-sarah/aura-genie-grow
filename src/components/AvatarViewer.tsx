interface AvatarViewerProps {
  avatarUrl: string;
}

export default function AvatarViewer({ avatarUrl }: AvatarViewerProps) {
  // Use Ready Player Me demo viewer with frameApi
  const displayUrl = `https://demo.readyplayer.me/avatar?frameApi&url=${encodeURIComponent(avatarUrl)}`;
  
  return (
    <div className="h-64 w-full rounded-lg mb-4 bg-black/5">
      <iframe
        key={displayUrl}
        src={displayUrl}
        allow="camera; microphone"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '0.5rem'
        }}
      />
    </div>
  );
}