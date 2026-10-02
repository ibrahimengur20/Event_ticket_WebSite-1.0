    import { useContext, useState } from "react";

    import { Context } from "../Context/CartContext";

    function Checkout() {
    const { cartItems, setCartItems } = useContext(Context);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const totalPrice = cartItems.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
    );

    async function handleCheckout() {
        const token = localStorage.getItem("token");

        if (!token) {
        setMessage("Sipariş vermek için giriş yapmalısınız.");
        return;
        }

        if (cartItems.length === 0) {
        setMessage("Sepetiniz boş.");
        return;
        }

        try {
        setLoading(true);

        for (const item of cartItems) {
            const response = await fetch(
            "http://localhost:5000/api/orders",
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                eventId: item.id,
                quantity: item.quantity,
                }),
            }
            );

            const data = await response.json();

            if (!response.ok) {
            throw new Error(data.message || "Sipariş oluşturulamadı.");
            }
        }

        setCartItems([]);
        setMessage("Siparişleriniz başarıyla oluşturuldu.");
        } catch (error) {
        setMessage(error.message);
        } finally {
        setLoading(false);
        }
    }

    return (
        <div>
        <h1>Siparişi Tamamla</h1>

        <p>
            Toplam: {totalPrice.toLocaleString("tr-TR")} TL
        </p>

        <button onClick={handleCheckout} disabled={loading}>
            {loading ? "İşleniyor..." : "Siparişi Tamamla"}
        </button>

        {message && <p>{message}</p>}
        </div>
    );
    }

    export default Checkout;