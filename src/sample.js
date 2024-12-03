import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import videoSrc from "/assets/Video.mp4";
import subtitlesSrc from "/assets/subtitles.vtt";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const previewImgRef = useRef(null);

  const [isPaused, setIsPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewPosition, setPreviewPosition] = useState(0);

  useEffect(() => {
    const video = videoRef.current;

    const handleMetadataLoad = () => {
      setTotalTime(video.duration);
    };

    const handleKeyDown = (e) => {
      switch (e.code) {
        case "KeyK":
        case "Space":
          e.preventDefault();
          togglePlayPause();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullScreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    video.addEventListener("loadedmetadata", handleMetadataLoad);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadataLoad);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !isMuted;
    setIsMuted(video.muted);
    setVolume(video.muted ? 0 : video.volume);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    setCurrentTime(video.currentTime);
    setProgress(video.currentTime / video.duration);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const toggleFullScreen = () => {
    const container = videoRef.current.parentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const toggleTheaterMode = () => {
    setIsTheaterMode((prev) => !prev);
  };
  const handleTimelineHover = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const hoverPosition = Math.min(Math.max(0, e.clientX - rect.x), rect.width);
    const hoverTime = (hoverPosition / rect.width) * videoRef.current.duration;
  
    setPreviewTime(hoverTime);
    setPreviewPosition((hoverPosition / rect.width) * 100);
    setPreviewVisible(true);
  
    // Calculate preview image index
    const totalPreviews = 10; // Adjust based on the number of preview images available
    const previewNumber = Math.max(
      1,
      Math.min(totalPreviews, Math.floor((hoverTime / videoRef.current.duration) * totalPreviews))
    );
  
     const previewPath = `/assets/previewImgs/preview${previewNumber}.jpg`;
    previewImgRef.current.src = previewPath;
  };
  

  const hidePreview = () => {
    setPreviewVisible(false);
  };

  const handleTimelineScrub = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const scrubPosition = Math.min(
      Math.max(0, e.clientX - rect.x),
      rect.width
    );
    const scrubTime =
      (scrubPosition / rect.width) * videoRef.current.duration;

    videoRef.current.currentTime = scrubTime;
    setCurrentTime(scrubTime);
    setProgress(scrubPosition / rect.width);
  };

  return (
    <div
      className={`video-container ${isTheaterMode ? "theater-mode" : ""}`}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        onTimeUpdate={handleTimeUpdate}
        className="video-element"
        onClick={togglePlayPause}
        controls={false}
      >
        <track
          kind="subtitles"
          src={subtitlesSrc}
          srclang="en"
          label="English"
        />
      </video>
      <div
        className="timeline-container"
        ref={timelineRef}
        onMouseMove={handleTimelineHover}
        onMouseLeave={hidePreview}
        onClick={handleTimelineScrub}
      >
        <div className="timeline">
          <div
            className="timeline-progress"
            style={{ width: `${progress * 100}%` }}
          />
          {previewVisible && (
            <div
              className="preview-container"
              style={{ left: `${previewPosition}%` }}
            >
              <img
                ref={previewImgRef}
                alt="Preview"
                className="preview-thumbnail"
              />
              <div className="preview-time">{formatTime(previewTime)}</div>
            </div>
          )}
        </div>
      </div>
      <div className="controls">
        <button onClick={togglePlayPause}>
          {isPaused ? "Play" : "Pause"}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
        />
        <button onClick={toggleMute}>
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <div>
          {formatTime(currentTime)} / {formatTime(totalTime)}
        </div>
        <button onClick={toggleTheaterMode}>
          {isTheaterMode ? "Exit Theater" : "Theater Mode"}
        </button>
        <button onClick={toggleFullScreen}>Full Screen</button>
      </div>
    </div>
  );
};

export default VideoPlayer;
