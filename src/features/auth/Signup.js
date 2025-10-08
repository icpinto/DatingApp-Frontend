import { useState } from "react";
import api from "../../shared/services/api";
import { Link } from "react-router-dom";
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
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import "./Auth.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      await api.post("/register", {
        username,
        email,
        password,
      });
      setSnackbar({
        open: true,
        message: "Signup successful! You can now log in.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Signup failed. Please try again.",
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
          Signup
        </Typography>
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
            helperText={errors.username || "Choose a unique username"}
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
            helperText={errors.email || "We'll never share your email"}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
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
              if (e.target.value.length >= 6) {
                setErrors((prev) => ({ ...prev, password: "" }));
              } else {
                setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }));
              }
            }}
            error={Boolean(errors.password)}
            helperText={errors.password || "At least 6 characters"}
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
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
        </Box>
        <div className="auth-switch">
          <span>Already have an account? </span>
          <Link to="/">Log in</Link>
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

export default Signup;
