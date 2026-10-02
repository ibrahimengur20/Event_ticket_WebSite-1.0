import { useContext, useEffect } from "react";
import { Context } from "../Context/CartContext";
import { useNavigate } from "react-router-dom";

function Sepet() {
  const navigate = useNavigate();

  const { cartItems, setCartItems } = useContext(Context);

  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  function increaseQuantity(itemId) {
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });

    setCartItems(updatedCartItems);
  }

  function decreaseQuantity(itemId) {
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === itemId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });

    setCartItems(updatedCartItems);
  }

  function removeItem(itemId) {
    const updatedCartItems = cartItems.filter(
      (item) => item.id !== itemId
    );

    setCartItems(updatedCartItems);
  }

  function clearCart() {
    setCartItems([]);
  }

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <div className="checkout-page">
      <h1>Sepetim</h1>

      <p>
        Toplam Fiyat: {totalPrice.toLocaleString("tr-TR")} TL
      </p>

      {cartItems.length === 0 ? (
        <p>Sepetiniz boş.</p>
      ) : (
        <>
          <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                {item.name} - Adet: {item.quantity}

                <button onClick={() => increaseQuantity(item.id)}>
                  +
                </button>

                <button onClick={() => decreaseQuantity(item.id)}>
                  -
                </button>

                <button onClick={() => removeItem(item.id)}>
                  Sil
                </button>

                - Fiyat: {item.price} TL
              </li>
            ))}
          </ul>

          <button onClick={clearCart}>
            Sepeti Temizle
          </button>

          <button onClick={() => navigate("/checkout")}>
            Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default Sepet;