import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [location, setLocation] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state variable

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  }

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  }

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Set loading to true when starting the request
    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);
    formData.append('location', location);
    try {
      const response = await axios.post('http://localhost:5000/process-pdf', formData);
      setAnswer(response.data.answer);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); // Set loading to false after the request is finished
    }
  }

  return (
    <div className="App" style={{ padding: '10px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', color: '#444' }}>AI Attorney</h1>
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', margin: 'auto' }}>
        <label>
          PDF (optional):
          <input type="file" onChange={handleFileChange} style={{ margin: '10px 0' }} />
        </label>
        <label>
        Question:
          <input type="text" value={question} onChange={handleQuestionChange} required style={{ margin: '10px 0', padding: '5px' }} />
        </label>
        <label>
          Location:
          <input type="text" value={location} onChange={handleLocationChange} required style={{ margin: '10px 0', padding: '5px' }} />
        </label>
        <input type="submit" value="Submit" style={{ margin: '20px 0', padding: '10px', background: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} />
      </form>
      {isLoading && file && <p style={{ textAlign: 'center', marginTop: '10px', color: '#999' }}>Processing... This may take several minutes depending on the document size.</p>}
      {answer && <p style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>Answer: {answer}</p>}
    </div>
  );
}

export default App;

