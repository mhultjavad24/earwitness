import { useState, useRef, useEffect } from 'react';
import './AudioRecorder.css';

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
}

const AudioRecorder = ({ onRecordingComplete }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [availableMicrophones, setAvailableMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load available microphones
  useEffect(() => {
    const getMicrophones = async () => {
      try {
        // Request permission first by accessing any audio device
        await navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            // Stop this initial stream
            stream.getTracks().forEach(track => track.stop());
          });

        // Then enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const microphones = devices.filter(device => device.kind === 'audioinput');
        setAvailableMicrophones(microphones);
        
        // Select the default microphone
        if (microphones.length > 0) {
          setSelectedMicrophoneId(microphones[0].deviceId);
        }
      } catch (err) {
        setError('Unable to access microphone. Please ensure you have a microphone connected and have granted permission.');
        console.error('Error accessing microphones:', err);
      }
    };

    getMicrophones();
  }, []);

  // Start recording function
  const startRecording = async () => {
    try {
      if (!selectedMicrophoneId) {
        setError('No microphone selected. Please select a microphone.');
        return;
      }

      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMicrophoneId ? { exact: selectedMicrophoneId } : undefined
        }
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
    } catch (err) {
      setError('Failed to start recording. Please check your microphone permissions.');
      console.error('Error starting recording:', err);
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Play audio function
  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPaused(false);
      
      // Update progress bar during playback
      const updateProgressBar = () => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setPlaybackProgress(progress);
          
          if (audioRef.current.paused) {
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
          } else {
            animationFrameRef.current = requestAnimationFrame(updateProgressBar);
          }
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(updateProgressBar);
    }
  };

  // Pause audio function
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };

  // Set audio position based on progress bar
  const setAudioPosition = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && audioUrl) {
      const percent = parseInt(event.target.value);
      const time = (percent / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setPlaybackProgress(percent);
    }
  };

  // Change volume
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle microphone selection
  const handleMicrophoneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMicrophoneId(event.target.value);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="audio-recorder flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-gray-800 text-gray-100">
      <h2 className="text-xl font-semibold mb-4">Audio Recorder</h2>
      
      {error && (
        <div className="error-message text-red-500 mb-4">
          {error}
        </div>
      )}
      
      <div className="microphone-selection mb-4">
        <label htmlFor="microphone-select" className="block text-sm font-medium mb-2">Select Microphone:</label>
        <select 
          id="microphone-select" 
          value={selectedMicrophoneId} 
          onChange={handleMicrophoneChange}
          disabled={isRecording}
          className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {availableMicrophones.length === 0 && (
            <option value="">No microphones found</option>
          )}
          {availableMicrophones.map((mic) => (
            <option key={mic.deviceId} value={mic.deviceId}>
              {mic.label || `Microphone ${mic.deviceId.slice(0, 5)}...`}
            </option>
          ))}
        </select>
      </div>
      
      <div className="recorder-controls flex items-center space-x-4">
        {!isRecording ? (
          <button 
            onClick={startRecording} 
            className="record-button bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            disabled={availableMicrophones.length === 0}
            aria-label="Start recording"
          >
            Record
          </button>
        ) : (
          <>
            <div className="recording-indicator flex items-center space-x-2">
              <span className="recording-dot w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
              <span>Recording: {formatTime(recordingTime)}</span>
            </div>
            <button 
              onClick={stopRecording} 
              className="stop-button bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label="Stop recording"
            >
              Stop
            </button>
          </>
        )}
      </div>
      
      {audioUrl && (
        <div className="playback-controls">
          <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPaused(true)} />
          
          <div className="playback-buttons">
            {isPaused ? (
              <button 
                onClick={playAudio} 
                className="play-button"
                aria-label="Play recording"
              >
                Play
              </button>
            ) : (
              <button 
                onClick={pauseAudio} 
                className="pause-button"
                aria-label="Pause playback"
              >
                Pause
              </button>
            )}
          </div>
          
          <div className="progress-container">
            <input
              type="range"
              min="0"
              max="100"
              value={playbackProgress}
              onChange={setAudioPosition}
              className="progress-bar"
              aria-label="Playback progress"
            />
            <div className="progress-time">{audioRef.current ? formatTime(Math.floor(audioRef.current.currentTime)) : '00:00'}</div>
          </div>
          
          <div className="volume-control">
            <label htmlFor="volume-slider">Volume:</label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="Volume control"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;