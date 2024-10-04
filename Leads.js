import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// Create a Supabase client instance
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Leads = () => {
  const [formData, setFormData] = useState({
    contact: '',
    field: '',
    name: '',
    address: '',
    docType: '',
    appointment: null, // New appointment field
  });
  const [formVisible, setFormVisible] = useState(false);
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    fetchLeadsData();
  }, []);

  const fetchLeadsData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('leads').select('*');
      if (error) throw error;
      setLeadsData(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching leads.', severity: 'error' });
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (newValue) => {
    setFormData((prevData) => ({ ...prevData, appointment: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.appointment) {
      setSnackbar({ open: true, message: 'Appointment is required.', severity: 'error' });
      return;
    }

    try {
      const { data, error } = await supabase.from('leads').insert([formData]);
      if (error) throw error;

      setSnackbar({ open: true, message: 'Lead added successfully!', severity: 'success' });
      setFormData({ contact: '', field: '', name: '', address: '', docType: '', appointment: null });
      setFormVisible(false);
      fetchLeadsData(); // Re-fetch the data after adding a new lead
    } catch (error) {
      setSnackbar({ open: true, message: 'Error adding lead.', severity: 'error' });
      console.error('Error adding lead:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="container">
        <Typography variant="h4" gutterBottom>
          Leads
        </Typography>
        <Navbar />

        <Button variant="contained" onClick={() => setFormVisible(true)} sx={{ mb: 2 }} style={{ marginTop: '10px' }}>
          Create Lead
        </Button>

        {formVisible && (
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
            {Object.entries(formData).map(([key, value]) => (
              key !== 'appointment' ? (
                <TextField
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name={key}
                  value={value}
                  onChange={handleChange}
                  required
                />
              ) : (
                <DateTimePicker
                  key={key}
                  label="Appointment"
                  value={value}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                />
              )
            ))}
            <Button type="submit" variant="contained" sx={{ mr: 1 }} disabled={loading}>
              Add Lead
            </Button>
            <Button variant="outlined" onClick={() => setFormVisible(false)} style={{ marginTop: '10px' }}>
              Cancel
            </Button>
          </Box>
        )}

        {loading ? (
          <Typography>Loading leads...</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contact</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Doc Type</TableCell>
                  <TableCell>Appointment</TableCell> {/* New column for appointment */}
                </TableRow>
              </TableHead>
              <TableBody>
                {leadsData.map((lead) => (
                  <TableRow key={lead.id}> {/* Assuming 'id' is a unique identifier */}
                    <TableCell>{lead.contact}</TableCell>
                    <TableCell>{lead.field}</TableCell>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.address}</TableCell>
                    <TableCell>{lead.docType}</TableCell>
                    <TableCell>{lead.appointment ? new Date(lead.appointment).toLocaleString() : 'N/A'}</TableCell> {/* Format the appointment date */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Link to="/home">
          <Button variant="contained" sx={{ mt: 2 }}>
            Home Page
          </Button>
        </Link>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
};

export default Leads;
