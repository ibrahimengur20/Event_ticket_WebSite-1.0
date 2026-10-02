import { useState } from "react";

function Register() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const userData = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Kayıt başarısız oldu.");
        return;
      }

      setMessage(result.message);
      event.currentTarget.reset();
    } catch (error) {
      console.error("Kayıt isteği başarısız:", error);
      setMessage("Sunucuya bağlanılamadı.");
    }
  }

  return (
    <div className="register-page">
      <h1>Kayıt Ol</h1>

      <form className="register-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Kullanıcı Adı:</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          placeholder="Kullanıcı adını gir"
        />

        <label htmlFor="email">E-posta:</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="E-posta adresini gir"
        />

        <label htmlFor="password">Şifre:</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          placeholder="Şifre gir"
        />

        <button type="submit">Kayıt Ol</button>
        {message && <p role="status">{message}</p>}
      </form>
    </div>
  );
}

export default Register;