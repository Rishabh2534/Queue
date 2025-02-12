import './HomePage.css';
import { NavLink } from 'react-router-dom';
function Home(){
   
    return(
        <>
        <div id="whole">
        <div id="left">
        <img src="https://th.bing.com/th/id/R.22f2c6d776c34368e9bea29ba16da8b8?rik=X6YRs6NX2FbsEg&riu=http%3a%2f%2flogotypes101.com%2flogos%2f346%2f93F02965C016D259C08D4908E61D8528%2fQueue.png&ehk=l7y1%2bpJgUhz2UwBQ0mo%2ff5NXs%2b7CP7nZawzz8GdyEzU%3d&risl=&pid=ImgRaw&r=0" alt="QUEUE" />
        <h1>WhY Q?</h1>
        
       <NavLink to="/loginSignup/signup">  <button >Get Started</button></NavLink>
       
       
         <NavLink to="/loginSignup/login"><button>Already a user</button></NavLink>
         
        </div>
        <div class="container">
        <div class="queue-box">
            <div class="person"></div>
            <div class="person"></div>
            <div class="person"></div>
            <div class="person"></div>
            
        </div>
        </div>
        <div class="Right">
            <h1>About Us</h1>

            <h5>We create one stop solution for the queue in any public place Just get started with us and get
                 rid of traditional human queue in your workplace.</h5>
        </div>
    </div>
        </>
    )
}
export default Home;