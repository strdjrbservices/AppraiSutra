import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';

const CustomQuery = () => {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [formType, setFormType] = useState('1004'); // Default form type
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError('');
    setResponse(null);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleFormTypeChange = (event) => {
    setFormType(event.target.value);
  };

  // Convert a JS object to readable plain text with indentation.
  const jsonToPlainText = (obj, indent = 0) => {
    const pad = '  '.repeat(indent);
    if (obj === null) return `${pad}null`;
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      return `${pad}${obj}`;
    }

    // plain object
    const keys = Object.keys(obj);
    if (keys.length === 0) return `${pad}{}`;
    return keys
      .map((key) => {
        const value = obj[key];
        if (value === null) return `${pad}${key}: null`;
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return `${pad}${key}: ${value}`;
        }
        // nested structure
        return `${pad}${key}:\n${jsonToPlainText(value, indent + 1)}`;
      })
      .join('\n');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please upload a PDF file.');
      return;
    }
    if (!comment.trim()) {
      setError('Please enter a query or comment.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('form_type', formType);
    formData.append('comment', comment);

    try {
      const res = await fetch('/extract', {
        method: 'POST',
        body: formData,
      });

 
      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP error! status: ${res.status}`);
      }

      // Try to parse server reply as JSON and convert to plain text when possible.
      let finalText = text;
      try {
       
        const parsed = JSON.parse(text);
        finalText = jsonToPlainText(parsed);
      } catch (err) {
        // Not JSON, keep original text.
      }

      setResponse(finalText);
    } catch (e) {
      setError(e.message || 'An unexpected error occurred.');
      console.error('Extraction failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Custom PDF Query
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Button
            variant="contained"
            component="label"
          >
            Upload Revised / Updated PDF
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={handleFileChange}
            />
          </Button>
          {file && <Typography variant="body2">Selected: {file.name}</Typography>}

          <FormControl fullWidth>
            <InputLabel id="form-type-label">Form Type</InputLabel>
            <Select
              labelId="form-type-label"
              value={formType}
              label="Form Type"
              onChange={handleFormTypeChange}
            >
              <MenuItem value="1004">1004</MenuItem>
              <MenuItem value="1073">1073</MenuItem>
              <MenuItem value="1007">1007</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Enter your query or comment"
            multiline
            rows={4}
            value={comment}
            onChange={handleCommentChange}
            variant="outlined"
            fullWidth
            required
          />

          <Box sx={{ position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !file}
              fullWidth
            >
              Extract Information
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </Stack>
      </form>

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

      {response }
    </Paper>
  );
};

export default CustomQuery;
