function Navbar() {
  return (
    <nav className="main-navbar">
      <div className="navbar-logo">
        EventHub
      </div>

      <div className="navbar-links">
        <a href="#">Etkinlikler</a>
        <a href="#">Kategoriler</a>
        <a href="#">Şehirler</a>
        <a href="#">Biletlerim</a>
      </div>

      <div className="navbar-actions">
        <button className="navbar-login">Giriş Yap</button>
        <button className="navbar-register">Üye Ol</button>
      </div>
    </nav>
  );
}

export default Navbar;