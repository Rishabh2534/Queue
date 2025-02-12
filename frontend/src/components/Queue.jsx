import { useEffect, useState } from "react";
import io from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";
import { useParams } from "react-router-dom";
import "./LoginSignUp.css"; // Import CSS file

const ApiEndpoint = "http://localhost:3000";
const socket = io(ApiEndpoint);

const Queue = () => {
    const { userId } = useParams();
    const [queue, setQueue] = useState(["1","2","3"]);
    const [qr, setQr] = useState("");
    
    useEffect(() => {
        fetchQueue();
        fetchQRCode();
        if (!socket.hasJoined) {
            socket.emit("joinQueue", userId);
            socket.hasJoined = true;  // Prevents duplicate joins
        }
        socket.on("queueUpdated", () => {
            console.log("Queue updated for user:", userId);
            fetchQueue();  // Reload queue when an update is received
        });

        return () => {
            socket.off("queueUpdated");
        };
    }, [userId]);

    const fetchQRCode = async () => {
        try {
            const response = await fetch(`${ApiEndpoint}/getqr/${userId}`);
            const data = await response.json();
            setQr(data.QRCodeCanvas);
        } catch (error) {
            console.error("Error fetching QR code:", error);
        }
    };

    const fetchQueue = async () => {
        try {
            const response = await fetch(`${ApiEndpoint}/queue/${userId}`);
            const queueData = await response.json();
            setQueue(queueData);
        } catch (error) {
            console.log("Error fetching queue", error);
        }
    };

    const serveNext = async () => {
        if (queue.length === 0) return;
        try {
            await fetch(`${ApiEndpoint}/queue/${userId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            socket.emit("updateQueue", userId);
        } catch (error) {
            console.error("Error serving next:", error);
        }
    };

    return (
        <div className="queue-container">
            <h2 className="queue-title">📋 My Queue</h2>

            {/* QR Code Section */}
            <div className="qr-container">
                <h3>Scan to Join</h3>
                {qr ? (
                    <img src={qr} alt="QR Code" className="qr-image" />
                ) : (
                    <QRCodeCanvas value={`http://localhost:5173/join/${userId}`} className="qr-image" />
                )}
            </div>

            {/* Queue List */}
            <div className="queue-list">
                <h3>Waiting List:</h3>
                {queue.length > 0 ? (
                    <ul>
                        {queue.map((user, index) => (
                            <li key={user.id} className="queue-item">
                                <div className="queue-info">
                                    <p className="queue-name">{user.name}</p>
                                    <p className="queue-phone">📞 {user.phone}</p>
                                    <p className="queue-time">⏳ Joined: {new Date(user.joinedAt).toLocaleTimeString()}</p>
                                </div>
                                <span className="queue-number">#{index + 1}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-queue">No one in the queue yet.</p>
                )}
            </div>

            {/* Serve Next Button */}
            <button
                onClick={serveNext}
                disabled={queue.length === 0}
                className="serve-button"
            >
                ✅ Serve Next
            </button>
        </div>
    );
};

export default Queue;
