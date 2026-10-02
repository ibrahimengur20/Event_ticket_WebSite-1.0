import React, { useEffect, useState } from "react";
function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {

    async function fetchTickets() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Giriş yapmanız gerekiyor.");
        setLoading(false);
        return;
      }
    
        try {
            const response = await fetch("http://localhost:5000/api/orders/my-orders", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Biletler alınamadı.");
            }   

        const data = await response.json();
        setTickets(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }
    fetchTickets();
    }, []);

    if (loading) {

        return <p>Biletler yükleniyor...</p>;
    }       



    if (error) {
        return <p>{error}</p>;
    }   


    if (tickets.length === 0) {
        return <p>Henüz biletiniz yok.</p>;
    }

    return (
        <div className="my-tickets-container">
            <h1>Satın Aldığım Biletler</h1>
            <ul className="my-tickets-list">
                {tickets.map((ticket) => (
                    <li key={ticket.orderId} className="my-ticket-item">
                        <h2>{ticket.eventName}</h2>
                        <p><strong>Tarih:</strong> {new Date(ticket.eventDate).toLocaleDateString("tr-TR")}</p>
                        <p><strong>Toplam Fiyat:</strong> {Number(ticket.totalPrice).toLocaleString("tr-TR")} TL</p>   
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default MyTickets;