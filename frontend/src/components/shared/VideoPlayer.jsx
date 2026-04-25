import React, { useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';

const VideoPlayer = ({ url, title }) => {
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div className="premium-card overflow-hidden bg-black aspect-video relative group">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls={true}
        config={{
          youtube: {
            playerVars: { 
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3
            }
          }
        }}
      />
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-black rounded-lg uppercase tracking-widest border border-white/20">
          {title}
        </span>
      </div>
      
      {/* Overlay to prevent some clicks if needed, though controls are enabled for seeking */}
      <div className="absolute inset-0 pointer-events-none border-4 border-indigo-600/20 rounded-2xl"></div>
    </div>
  );
};

export default VideoPlayer;
