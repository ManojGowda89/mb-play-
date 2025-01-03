import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from './Comp/Layout';
import { useStore } from "../Store";
const LoginPage = () => {

  const {setLogin,setAdmin}  =useStore()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      }, {
        withCredentials: true,
      });

      if (response) {
        setLogin(true)
        setAdmin(response.data.isAdmin)
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <Layout>
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center">
          Login
        </Typography>
        {error && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          sx={{ mt: 3 }}
        >
          Login
        </Button>
      </Box>
    </Container>
    </Layout>
  );
};

export default LoginPage;
