import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../Context/CartContext";


function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { cartItems, setCartItems } = useContext(Context);

  useEffect(() => {
    setEvent(null);
    setError("");

    fetch(`http://localhost:5000/api/events/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Etkinlik bulunamadı.");
        return response.json();
      })
      .then(setEvent)
      .catch(() => setError("Etkinlik detayı yüklenemedi."));
  }, [id]);
  function addToCart() {
  const newItem = {
    id: event.id,
    name: event.name,
    price: event.price,
    quantity: quantity
  };

  setCartItems([...cartItems, newItem]);
  console.log(newItem);
}

  async function handleOrder() {
    setSubmitting(true);
    setOrderMessage("");
    setOrderError("");

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ eventId: Number(id), quantity }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Sipariş oluşturulamadı.");

      setOrderMessage(
        `Sipariş #${result.orderId} oluşturuldu. Toplam: ${Number(result.totalPrice).toLocaleString("tr-TR")} TL. Ödeme entegrasyonu henüz eklenmedi.`
      );
      setEvent((currentEvent) => ({
        ...currentEvent,
        availableTickets: result.availableTickets,
      }));
      setQuantity(1);
    } catch (requestError) {
      setOrderError(requestError.message || "Sipariş oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <p className="event-detail-message">{error}</p>;
  if (!event) return <p className="event-detail-message">Etkinlik yükleniyor...</p>;

  const availableTickets = Number(event.availableTickets);
  const noTickets = availableTickets <= 0;
  const totalPrice = Number(event.price) * quantity;

  return (
    <main className="event-detail">
      <img
        className="event-detail-image"
        src={event.imageUrl}
        alt={event.name}
      />

      <section className="event-detail-content">
        <span className="event-detail-category">{event.categoryName}</span>
        <h1>{event.name}</h1>
        <p className="event-detail-description">{event.description}</p>

        <div className="event-detail-info">
          <p><strong>Konum</strong><span>{event.location}</span></p>
          <p><strong>Tarih</strong><span>{String(event.eventDate).slice(0, 10)}</span></p>
          <p><strong>Kalan bilet</strong><span>{availableTickets}</span></p>
        </div>

        <div className="event-detail-purchase">
          <label className="ticket-quantity">
            Bilet adedi
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={noTickets || submitting}
            >
              {Array.from({ length: Math.min(10, availableTickets) }, (_, index) => (
                <option key={index + 1} value={index + 1}>{index + 1}</option>
              ))}
            </select>
          </label>

          <div className="event-detail-total">
            <span>Toplam</span>
            <strong>{totalPrice.toLocaleString("tr-TR")} TL</strong>
          </div>

          <button
            className="buy-button"
            type="button"
            onClick={addToCart}
            disabled={noTickets || submitting}
          >
            {noTickets ? "Bilet kalmadı" : submitting ? "İşleniyor..." : "Sepete Ekle"}
          </button>
        </div>

        {orderMessage && <p className="order-message">{orderMessage}</p>}
        {orderError && <p className="order-error">{orderError}</p>}
      </section>
    </main>
  );
}

export default EventDetail;
