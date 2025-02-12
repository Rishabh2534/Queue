import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LoginSignUp.css"
function LoginSignUp() {
  const { act } = useParams();  
  const navigate = useNavigate(); 
  const [actState, setActState] = useState(act || "signup");  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    timeToServe:"",
    field: "",
    Location: "",
  });

  useEffect(() => {
    
    setActState(act||"signup");
  }, [act]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle Form Submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let url = actState === "signup" ? "http://localhost:3000/Signup" : "http://localhost:3000/Login";
      let response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data = await response.json();
      if (data.success) {
        const userId = data.userId;  

       

        // Redirect to Queue page with userId
        navigate(`/queue/${userId}`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong! Please try again.");
    }
  };

  return (
    <>
      <h1>{actState === "login" ? "Login" : "Sign Up"}</h1>
      <form onSubmit={handleSubmit}>
        {actState === "signup" && (
          <>
            <label htmlFor="name">Name</label>
            <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />
          </>
        )}

        <label htmlFor="email">Email</label>
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />

        {actState === "signup" && (
          <>
           <label htmlFor="timeTo serve">Time to Serve each Client</label>
           <input type="text" name="timeToServe" placeholder="In seconds" required onChange={handleChange} />
           
           <label htmlFor="Location">Enter Location of Service</label>
           <input type="text" name="location" placeholder="place followed by landmark and pin" required onChange={handleChange} />
            
            <label htmlFor="field">Select Field</label>
            <input type="radio" name="field" value="Medical" id="medical" onChange={handleChange} />
            <label htmlFor="medical">Medical</label>
            <input type="radio" name="field" value="School" id="school" onChange={handleChange} />
            <label htmlFor="school">School</label>
            <input type="radio" name="field" value="Other" id="other" onChange={handleChange} />
            <label htmlFor="other">Other</label>
          </>
        )}

        <button type="submit">{actState === "login" ? "Login" : "Sign Up"}</button>
      </form>
    </>
  );
}

export default LoginSignUp;
