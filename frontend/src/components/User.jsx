import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";  

const ApiEndpoint = "http://localhost:3000";
const socket = io(ApiEndpoint);
const JoinQueue = () => {
    const [clientPhoneNumber,setClientPhoneNumber]= useState(null);
    const [thisNo, setthisNo] = useState(0);
    const [Q, setQ] = useState([]);
    const { userId } = useParams();
    const [client, setClient] = useState("");
    const [location, setLocation] = useState(null);
    const [LocateError, setLocateError] = useState(null);
    const [timeToReach,setTimeToReach]= useState(null);
    const [timeToServe,setTimeToServe]=useState(null);
    // Function to fetch the queue from the server
    const fetchQueue = async () => {
        try {
            const response = await fetch(`${ApiEndpoint}/queue/${userId}`);
            const data = await response.json();
            setQ(data);
            if(thisNo==0)setthisNo(data.length+1);
        } catch (e) {
            console.error("Error fetching queue:", e);
        }
    };
    const setlocation = (event) => {
        setLocation(event.target.value); // Update state with input value
    };
    const setPhoneNumber =(event)=>{
        setClientPhoneNumber(event.target.value);
    }
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                },
                (error) => {
                    setLocateError(error.message);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

    useEffect(() => {
        fetchQueue(); // Initial queue fetch
        getLocation();
        socket.on("deleteFromQ", () => {
            fetchQueue(); // Refetch queue on deletion
        });

        socket.on("queueUpdated", () => {
            fetchQueue(); // Refetch queue when updated
        });

        return () => {
            socket.off("deleteFromQ", fetchQueue);
            socket.off("queueUpdated", fetchQueue);
        };
    }, [userId]);

    const sendNotification = (message) => {
        axios.post(`${ApiEndpoint}/send-sms`, { message, clientPhoneNumber })
          .then(response => console.log('Notification sent!'))
          .catch(error => console.error('Error sending notification due to :', error));
      };
    // Recalculate client's position in the queue when the queue updates
    useEffect(() => {
      
        
        if (client) {
            const position = Q.findIndex((q) => q._id === client) + 1;
            alert(position);
            setthisNo(position > 0 ? position : 0); // Update thisNo with correct position\
            try{if(timeToReach<=(position+1)*timeToServe){
                sendNotification("It's time to leave for your appointment!");}
            }catch(e){ console.log("chutiya");console.log(e);alert("error sending noti");}
        }
    }, [Q, client]);

    const join = async () => {
        try {
        
            const response = await axios.post(`${ApiEndpoint}/queue`, { userId:userId,clientLocation:location });
            setClient(response.data._id); // Correctly storing client's unique ID
            setTimeToReach(response.data.timeToReach);
            setTimeToServe(response.data.timeToServe);
            alert("Joined Queue!");

            // Update position immediately
            const position = Q.length + 1;
            setthisNo(position);
            
            socket.emit("joinQueue", userId);
            socket.emit("updateQueue", userId); 
        } catch (err) {
            console.error("Error joining queue:", err);
        }
    };

    return (
        <>
            <h2>Join Queue</h2>
            <div>
                <h3>Current Queue have:</h3>
                <h3>{Q.length}</h3>
                <h3>Your No:</h3>
                <h3>{thisNo}</h3>
                <p>{LocateError||location ? LocateError?`Error: ${error} `:"Location Fetched Proceed" : "Fetching location..."}</p>
                <div>{LocateError?(<>
                             <h3>Enter full Address</h3>
                             <input type="text"value={location} onChange={setlocation}></input>
                             </>):""}</div>
                <h3>Enter PhoneNo</h3>
                <input type="text" value={clientPhoneNumber} onChange={setPhoneNumber}></input>
                <button onClick={join}>Join</button>
            </div>
        </>
    );
};

export default JoinQueue;
