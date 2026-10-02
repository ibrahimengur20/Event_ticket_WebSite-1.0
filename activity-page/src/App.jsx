import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Sepet from "./pages/Sepet";
import Movie from "./pages/Movie";
import Music from "./pages/music";
import Art from "./pages/Art";
import Theater from "./pages/Theater";
import Sports from "./pages/Sports";
import MyTickets from "./pages/MyTickets";
import Logout from "./pages/Logout";
import {  CartProvider } from "./Context/CartContext";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <CartProvider>
        <div>

        <nav className="navbar">

          <Link to="/">Ana Sayfa</Link>
          <Link to="/events">Etkinlikler</Link>
          <Link to="/sepet">Sepet</Link>

          {token ? (
            <>
              <Link to="/my-tickets">Biletlerim</Link>
              <Link to="/logout">Çıkış Yap</Link>
            </>
          ) : (
            <>
              <Link to="/login">Giriş Yap</Link>
              <Link to="/register">Kayıt Ol</Link>
            </>
          )}

        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/movie" element={<Movie />} />
          <Route path="/music" element={<Music />} />
          <Route path="/art" element={<Art />} />
          <Route path="/theater" element={<Theater />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/sepet" element={<Sepet />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>

      </div>
      </CartProvider>
    </Router>
  );
}

export default App;

