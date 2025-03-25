import { useState } from 'react'
import './App.css'
import AudioRecorder from './components/AudioRecorder'
import QuoteDisplay from './components/QuoteDisplay'

function App() {
  const [recordings, setRecordings] = useState<Blob[]>([]);
  
  const handleRecordingComplete = (blob: Blob) => {
    setRecordings(prevRecordings => [...prevRecordings, blob]);
  };

  return (
    <div className="app-container">
      <h1>Earwitness - Audio Recording App</h1>
      
      <QuoteDisplay />
      
      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      
      {recordings.length > 0 && (
        <div className="recordings-counter">
          <p>Total recordings: {recordings.length}</p>
        </div>
      )}
    </div>
  )
}

export default App
