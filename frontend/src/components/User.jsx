import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";  

const ApiEndpoint = "http://localhost:3000";
const socket = io(ApiEndpoint);

const JoinQueue = () => {
    const [clientPhoneNumber, setClientPhoneNumber] = useState(null);
    const [thisNo, setthisNo] = useState(0);
    const [Q, setQ] = useState([]);
    const { userId } = useParams();
    const [client, setClient] = useState("");
    const [location, setLocation] = useState(null);
    const [LocateError, setLocateError] = useState(null);
    const [timeToReach, setTimeToReach] = useState(null);
    const [timeToServe, setTimeToServe] = useState(null);
    const [hasNotified, setHasNotified] = useState(false); 

    const fetchQueue = async () => {
        try {
            const response = await fetch(`${ApiEndpoint}/queue/${userId}`);
            const data = await response.json();
            setQ(data);
            if (thisNo === 0) setthisNo(data.length + 1);
        } catch (e) {
            console.error("Error fetching queue:", e);
        }
    };

    const setlocation = (event) => {
        setLocation(event.target.value);
    };

    const setPhoneNumber = (event) => {
        setClientPhoneNumber(event.target.value);
    };

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
            setLocateError("Geolocation is not supported by this browser.");
        }
    };

    useEffect(() => {
        fetchQueue();
        getLocation();
        socket.on("deleteFromQ", fetchQueue);
        socket.on("queueUpdated", fetchQueue);

        return () => {
            socket.off("deleteFromQ", fetchQueue);
            socket.off("queueUpdated", fetchQueue);
        };
    }, [userId]);

    const sendNotification = (message) => {
        axios.post(`${ApiEndpoint}/send-sms`, { message, clientPhoneNumber })
            .then(() => console.log("Notification sent!"))
            .catch(error => console.error("Error sending notification:", error));
    };

    useEffect(() => {
        if (client) {
            const position = Q.findIndex((q) => q._id === client) + 1;
            setthisNo(position > 0 ? position : 0);

            const estimatedServeTime = position * timeToServe;

            const shouldNotify =
                (position <= 5 || (timeToReach != null && timeToReach <= estimatedServeTime)) &&
                !hasNotified;

            if (shouldNotify) {
                sendNotification(" It's time to leave for your appointment!");
                setHasNotified(true);
            }
        }
    }, [Q, client]);

    const join = async () => {
        try {
            const response = await axios.post(`${ApiEndpoint}/queue`, {
                userId: userId,
                clientLocation: location,
            });

            setClient(response.data._id);
            setTimeToReach(response.data.timeToReach);
            setTimeToServe(response.data.timeToServe);
            alert("Joined Queue!");

            setthisNo(Q.length + 1);

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
                <h3>Current Queue has:</h3>
                <h3>{Q.length}</h3>
                <h3>Your No:</h3>
                <h3>{thisNo}</h3>
                <p>
                    {LocateError || location
                        ? LocateError
                            ? `Error: ${LocateError}`
                            : "Location Fetched. Proceed"
                        : "Fetching location..."}
                </p>

                {LocateError && (
                    <>
                        <h3>Enter full Address</h3>
                        <input type="text" value={location} onChange={setlocation} />
                    </>
                )}

                <h3>Enter Phone No</h3>
                <input type="text" value={clientPhoneNumber} onChange={setPhoneNumber} />
                <button onClick={join}>Join</button>
            </div>
        </>
    );
};

export default JoinQueue;
