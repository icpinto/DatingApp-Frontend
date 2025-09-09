import { useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { TextField, Button, Box, Snackbar, Alert } from "@mui/material";
import "./Auth.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required";
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await api.post("/register", {
        username,
        email,
        password,
      });
      setSnackbar({ open: true, message: "Signup successful! You can now log in.", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Signup failed. Please try again.", severity: "error" });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Signup</h2>
        <Box component="form" onSubmit={handleSignup} noValidate>
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
            helperText={errors.username}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (/\S+@\S+\.\S+/.test(e.target.value)) {
                setErrors((prev) => ({ ...prev, email: "" }));
              } else {
                setErrors((prev) => ({ ...prev, email: "Enter a valid email" }));
              }
            }}
            error={Boolean(errors.email)}
            helperText={errors.email}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value.length >= 6) {
                setErrors((prev) => ({ ...prev, password: "" }));
              } else {
                setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }));
              }
            }}
            error={Boolean(errors.password)}
            helperText={errors.password}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </Box>
        <div className="auth-switch">
          <span>Already have an account? </span>
          <Link to="/">Log in</Link>
        </div>
      </div>
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

export default Signup;
