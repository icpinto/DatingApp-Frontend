import { useState } from "react";
import axios from "axios";

function Signup(){
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("");

    const handleSignup = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post("http://localhost:8080/register", {
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
        <div>
          <h2>Signup</h2>
          <form onSubmit={handleSignup}>
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
            <button type="submit">Sign Up</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      );

}

export default Signup;
