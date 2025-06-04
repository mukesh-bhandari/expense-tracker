import { useState } from "react";
import { backend_url } from "./util";
import { useNavigate } from "react-router-dom";


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
    <>
      <h1>login</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="username" value={username} 
        onChange={(e)=> setUsername(e.target.value)} required></input>
        <input type="password" placeholder="password" value={password} onChange={(e)=> setPassword(e.target.value)} required></input>
        <button type="submit">submit</button>
      </form>
    </>
  );
}
export default LoginPage;
