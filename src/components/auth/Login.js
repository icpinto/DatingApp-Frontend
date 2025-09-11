import React, { useState } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Paper,
  Typography,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import "./Auth.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api.post("/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user_id", response.data.user_id);
      setSnackbar({
        open: true,
        message: "Login successful! Redirecting...",
        severity: "success",
      });
      setTimeout(() => navigate("/home"), 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Login failed. Please check your credentials.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Paper className="auth-container" elevation={3}>
        <Typography variant="h5" component="h2" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} noValidate>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (e.target.value) {
                setErrors((prev) => ({ ...prev, username: "" }));
              } else {
                setErrors((prev) => ({ ...prev, username: "Username is required" }));
              }
            }}
            error={Boolean(errors.username)}
            helperText={errors.username || "Enter your username"}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value) {
                setErrors((prev) => ({ ...prev, password: "" }));
              } else {
                setErrors((prev) => ({ ...prev, password: "Password is required" }));
              }
            }}
            error={Boolean(errors.password)}
            helperText={errors.password || "Enter your password"}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Log In"}
          </Button>
        </Box>
        <div className="auth-switch">
          <span>Don't have an account? </span>
          <Link to="/signup">Sign up</Link>
        </div>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Login;
