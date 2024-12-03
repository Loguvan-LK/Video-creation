import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import videoSrc from "./assets/Video.mp4";
import subtitlesSrc from "./assets/subtitles.vtt";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const previewImgRef = useRef(null);
  const [previewPosition, setPreviewPosition] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [lastVolume, setLastVolume] = useState(1); 
  const [isPaused, setIsPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [previewTime, setPreviewTime] = useState(0);
  const [areControlsVisible, setAreControlsVisible] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isFullScreen, setIsFullscreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [isCaptionEnabled, setIsCaptionEnabled] = useState(true);
  const hideControlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    const handleLoadedMetadata = () => {
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
        case "KeyT":
          e.preventDefault();
          toggleTheaterMode();
          break;
        case "KeyI":
          e.preventDefault();
          togglePIP();
          break;
        case "KeyC":
          e.preventDefault();
          toggleCaptions();
          break;
        case "ArrowUp":
          e.preventDefault();
          increaseVolume();
          break;
        case "ArrowDown":
          e.preventDefault();
          decreaseVolume();
          break;
        default:
          break;
      }
    };

    const handleEnterPIP = () => setIsMiniPlayer(true);
    const handleExitPIP = () => setIsMiniPlayer(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("enterpictureinpicture", handleEnterPIP);
    video.addEventListener("leavepictureinpicture", handleExitPIP);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("enterpictureinpicture", handleEnterPIP);
      video.removeEventListener("leavepictureinpicture", handleExitPIP);
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

  const hidePreview = () => {
    setPreviewVisible(false);
  };
  const handleTimelineScrub = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const scrubPosition = Math.min(Math.max(0, e.clientX - rect.x), rect.width);
    const scrubTime = (scrubPosition / rect.width) * videoRef.current.duration;

    videoRef.current.currentTime = scrubTime;
    setCurrentTime(scrubTime);
    setProgress(scrubPosition / rect.width);
  };
  const toggleMute = () => {
    const video = videoRef.current;
    if (isMuted) {
       video.muted = false;
      video.volume = lastVolume;  
      setVolume(lastVolume);
    } else {
       setLastVolume(video.volume);  
      video.muted = true;
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };
  const increaseVolume = () => {
    const video = videoRef.current;
    if (video.volume < 1) {
      const newVolume = Math.min(video.volume + 0.05, 1);
      video.volume = newVolume;
      setVolume(newVolume);
    }
  };
  
  const decreaseVolume = () => {
    const video = videoRef.current;
    if (video.volume > 0) {
      const newVolume = Math.max(video.volume - 0.05, 0);
      video.volume = newVolume;
      setVolume(newVolume);
    }
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

  const handleTimelineHover = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const hoverPosition = Math.min(Math.max(0, e.clientX - rect.x), rect.width);
    const hoverTime = (hoverPosition / rect.width) * videoRef.current.duration;

    setPreviewTime(hoverTime);
    setPreviewPosition((hoverPosition / rect.width) * 100);
    setPreviewVisible(true);

    const totalPreviews = 10; // Adjust based on the number of preview images available
    const previewNumber = Math.max(
      1,
      Math.min(
        totalPreviews,
        Math.floor((hoverTime / videoRef.current.duration) * totalPreviews)
      )
    );
    const previewPath = `/assets/previewImgs/preview${previewNumber}.jpg`;
    previewImgRef.current.src = previewPath;
  };

  const toggleFullScreen = () => {
    const container = videoRef.current.parentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      container.requestFullscreen();
      setIsFullscreen(true);
    }
  };
  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
    const videoContainer = document.querySelector(".video-container");
    if (videoContainer) {
      videoContainer.classList.toggle("theater-mode");
    }
  };

  const togglePIP = async () => {
    const video = videoRef.current;
    if (isMiniPlayer) {
      document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  };

  const toggleCaptions = () => {
    const track = videoRef.current.textTracks[0];
    const newCaptionState = track.mode === "showing" ? "disabled" : "showing";
    track.mode = newCaptionState;
    setIsCaptionEnabled(newCaptionState === "showing");
  };

  const changePlaybackSpeed = () => {
    const video = videoRef.current;
    const newRate = playbackRate === 2 ? 0.5 : playbackRate + 0.5;
    video.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  const handleMouseMove = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    setAreControlsVisible(true);
    hideControlsTimeoutRef.current = setTimeout(() => {
      setAreControlsVisible(false);
    }, 1000);
  };

  return (
    <div
      className={`video-container ${isPaused ? "paused" : ""}`}
      onMouseEnter={() => setAreControlsVisible(true)}
      onMouseLeave={() => setAreControlsVisible(false)}
      onMouseMove={handleMouseMove}
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
        className={`video-controls-container ${
          isPaused || areControlsVisible ? "visible" : ""
        }`}
      >
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
            <div
              className="thumb-indicator"
              style={{ "--progress-position": progress }}
            ></div>
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

        <div className="group-controls">
          <div className="left-controls">
            {/* Play/Pause */}
            <button className="play-pause-btn" onClick={togglePlayPause}>
              {isPaused ? (
                <svg className="play-icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                  />
                </svg>
              ) : (
                <svg className="pause-icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M14,19H18V5H14M6,19H10V5H6V19Z"
                  />
                </svg>
              )}
            </button>
            {/* Volume */}
            <button className="mute-btn" onClick={toggleMute}>
              <svg
                className={`volume-high-icon ${
                  isMuted || volume === 0 ? "hidden" : ""
                }`}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"
                />
              </svg>
              <svg
                className={`volume-muted-icon ${
                  isMuted || volume === 0 ? "" : "hidden"
                }`}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"
                />
              </svg>
            </button>
            <input
              className="volume-slider"
              type="range"
              min="0"
              max="1"
              step="any"
              value={volume}
              onChange={handleVolumeChange}
            />
            {formatTime(currentTime)} / {formatTime(totalTime)}
          </div>

          <div className="right-controls">
            {/* Captions */}
            <button
              className={`control-btn ${isCaptionEnabled ? "active" : ""}`}
              onClick={toggleCaptions}
            >
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M18,11H16.5V10.5H14.5V13.5H16.5V13H18V14A1,1 0 0,1 17,15H14A1,1 0 0,1 13,14V10A1,1 0 0,1 14,9H17A1,1 0 0,1 18,10M11,11H9.5V10.5H7.5V13.5H9.5V13H11V14A1,1 0 0,1 10,15H7A1,1 0 0,1 6,14V10A1,1 0 0,1 7,9H10A1,1 0 0,1 11,10M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H19A2,2 0 0,0 21,18V6C21,4.89 20.1,4 19,4Z"
                />
              </svg>
            </button>
            {/* Playback Speed */}
            <button onClick={changePlaybackSpeed}>{`${playbackRate}x`}</button>

            {/* Picture in Picture */}
            <button className="mini-player-btn" onClick={togglePIP}>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"
                />
              </svg>
            </button>

            {/* Theater Mode */}
            <button
              className="theater-btn control-btn"
              onClick={toggleTheaterMode}
            >
              {isTheaterMode ? (
                <svg className="wide" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"
                  />
                </svg>
              ) : (
                <svg className="tall" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"
                  />
                </svg>
              )}
            </button>

            {/* Full Screen */}
            <button className="full-screen-btn" onClick={toggleFullScreen}>
              <svg
                className={`open ${isFullScreen ? "hidden" : ""}`}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                />
              </svg>
              <svg
                className={`close ${!isFullScreen ? "hidden" : ""}`}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
