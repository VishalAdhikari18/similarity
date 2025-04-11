import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://similarity-a6o6.onrender.com';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 2) {
      setError('Please select only 2 files');
      return;
    }
    
    // Validate file types
    const invalidFiles = selectedFiles.filter(file => !file.name.endsWith('.txt'));
    if (invalidFiles.length > 0) {
      setError('Only .txt files are allowed');
      return;
    }

    // Validate file sizes (max 5MB each)
    const largeFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      setError('Files must be less than 5MB each');
      return;
    }

    setFiles(selectedFiles);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (files.length !== 2) {
      setError('Please select exactly 2 files');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });

    try {
      console.log('Sending files:', files.map(f => ({ name: f.name, size: f.size })));
      const response = await axios.post(`${API_URL}/api/compare`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('Response:', response.data);
      setResult(response.data);
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.details || 
                          err.response?.data?.error || 
                          'An error occurred while comparing documents';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Document Similarity Detector
        </Typography>
        
        <Typography variant="body1" paragraph align="center" color="text.secondary">
          Upload two text documents (.txt files) to compare their similarity. The system will return a score between 0 and 1,
          where 1 indicates identical documents and 0 means no similarity.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <input
            accept=".txt"
            style={{ display: 'none' }}
            id="raised-button-file"
            multiple
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span" fullWidth>
              Select Documents
            </Button>
          </label>

          {files.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Selected files:</Typography>
              {files.map((file, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </Typography>
              ))}
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={files.length !== 2 || loading}
          >
            Compare Documents
          </Button>
        </Box>

        {loading && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success">
              <Typography variant="h6">
                Similarity Score: {(result.similarity * 100).toFixed(2)}%
              </Typography>
              <Typography variant="body2">
                {result.message}
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App; 