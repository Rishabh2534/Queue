import '../App.css';
import {NavLink} from 'react-router-dom';
function Navigation() {
    const navItem = [{name:"Home",link:"/"}, {name:"Queue",link:"/Queue/:userId"},  {name:"Clients",link:"/"},  {name:"Edit",link:"/join/:userId"}];
    const footItem=[ {name:"Privacy policy",link:""},{name:"Instagram",link:""},{name:"facebook",link:""},{name:"Email",link:""},{name:"linkedIn",link:""}];
    return (
      <>
      <nav>
      {navItem.map((item, index) => (
          <a key={index} >
            <NavLink  to={item.link} className={({ isActive }) => isActive ? "active" : ""}>{item.name}</NavLink>
          </a>
        ))}
      </nav>
      <footer>
        {
          footItem.map((item,index)=>(
           <a key={index} href={item.link}>
            {item.name}
           </a>
          ))
        }
      </footer>
      </>
    );
  }
  
  export default Navigation;