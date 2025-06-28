import { useState } from "react";
import { backend_url } from "./util";
import { useNavigate } from "react-router-dom";
import './login.css';


function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch( "/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username, password}),
      });
      const data = await response.json(); 

      if (response.ok) {
        // console.log("Login successful:", data);
        navigate("/");
      } else {
        console.error("Login failed:", data.message);
      }
    } catch (error) {
      console.error("Error loggin in :", error);
    }
  
  };
return (
   <div className="login-container">
  <h1 className="login-title">Login</h1>
  <form className="login-form" onSubmit={handleSubmit}>
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
      className="login-input"
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="login-input"
    />
    <button type="submit" className="login-button">Sign In</button>
  </form>
</div>
  );

}
export default LoginPage;
