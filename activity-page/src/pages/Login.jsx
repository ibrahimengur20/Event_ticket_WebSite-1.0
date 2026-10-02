import { useState } from "react";

function Login() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const userData = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Kullanıcı adı veya şifre hatalı.");
      }
      localStorage.setItem("token", data.token);
      
      setMessage("Giriş başarılı!");
      console.log("Giriş başarılı:", data);
    } catch (error) {
      setMessage(error.message || "Sunucuya bağlanılamadı.");
      console.error("Giriş hatası:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleRegisterClick() {
    window.location.href = "/register";
  }

  return (
    <main className="login-page">
      <section className="login-container">
        <h1>Giriş Yap</h1>
        <p className="login-description">
          Etkinliklerini keşfetmeye devam et.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Kullanıcı adı</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Kullanıcı adını gir"
            autoComplete="username"
            required
          />

          <label htmlFor="password">Şifre</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Şifreni gir"
            autoComplete="current-password"
            required
          />

          {message && <p role="status">{message}</p>}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="register-prompt">
          Hesabın yok mu?
          <button
            className="register-button"
            type="button"
            onClick={handleRegisterClick}
          >
            Kayıt Ol
          </button>
        </p>
      </section>
    </main>
  );
}

export default Login;