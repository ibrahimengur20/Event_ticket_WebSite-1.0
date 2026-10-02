import Card from "./Card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Etkinlikler alınamadı.");
        }

        return response.json();
      })
      .then(setEvents)
      .catch(() => {
        setError("Etkinlikler yüklenemedi. Express ve MySQL bağlantısını kontrol et.");
      });
  }, []);

  const filteredEvents = events.filter((event) =>
    `${event.name} ${event.location}`
      .toLocaleLowerCase("tr-TR")
      .includes(search.toLocaleLowerCase("tr-TR"))
  );

  return (
    <>
      <div className="hero-section">
        <h1>Bir sonraki deneyimini keşfet</h1>
        <p>Etkinlikleri keşfet ve yeni deneyimler yaşa</p>

        <input
          type="text"
          placeholder="Etkinlik Ara"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <nav aria-label="Etkinlik kategorileri">
          <Link to="/movie">Film</Link>
          <Link to="/music">Müzik</Link>
          <Link to="/art">Sanat</Link>
          <Link to="/theater">Tiyatro</Link>
          <Link to="/sports">Spor</Link>
        </nav>
      </div>

      {error && <p>{error}</p>}

      <section className="popular-events-container">
        <h2>{search ? "Arama Sonuçları" : "Etkinlikler"}</h2>

        <div className="popular-events">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card
                key={event.id}
                id={event.id}
                name={event.name}
                image={event.imageUrl}
                location={event.location}
                date={String(event.eventDate).slice(0, 10)}
                price={event.price}
              />
            ))
          ) : (
            !error && <p>Gösterilecek etkinlik bulunamadı.</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;