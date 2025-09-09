import { useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import "./Auth.css";

function Signup(){
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("");

    const handleSignup = async (e) => {
      e.preventDefault();
      try {
        const response = await api.post("/register", {
          username,
          email,
          password,
        });
        setMessage("Signup successful! You can now log in.");
      } catch (error) {
        setMessage("Signup failed. Please try again.");
      }
    };



    return (
        <div className="auth-page">
          <div className="auth-container">
            <h2>Signup</h2>
            <form className="auth-form" onSubmit={handleSignup}>
              <div>
                <label>Username:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="auth-button" type="submit">Sign Up</button>
            </form>
            {message && <p>{message}</p>}
            <div className="auth-switch">
              <span>Already have an account? </span>
              <Link to="/">Log in</Link>
            </div>
          </div>
        </div>
      );

}

export default Signup;
