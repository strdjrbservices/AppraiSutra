import React from 'react';
import { Link } from 'react-router-dom';
import { Paper, Button, Typography, Stack, Box } from '@mui/material';

const HomePage = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Appraisal Tools
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Please select a tool to get started.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button component={Link} to="/extractor" variant="contained" size="large">
            Appraisal Extractor
          </Button>
          <Button component={Link} to="/query" variant="contained" color="secondary" size="large">
            Custom Query
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default HomePage;