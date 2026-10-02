import { useEffect, useState } from "react";
import Card from "./Card";

function CategoryEvents({ category }) {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(setEvents)
      .catch(() => setError("Etkinlikler yüklenemedi."));
  }, []);

  const categoryEvents = events.filter(
    (event) =>
      String(event.categoryName).toLocaleLowerCase("tr-TR") ===
      category.toLocaleLowerCase("tr-TR")
  );

  return (
    <section>
      <h1>{category} Etkinlikleri</h1>

      {error && <p>{error}</p>}

      <div className="popular-events">
        {categoryEvents.map((event) => (
          <Card
            key={event.id}
            id={event.id}
            name={event.name}
            image={event.imageUrl}
            location={event.location}
            date={String(event.eventDate).slice(0, 10)}
            price={event.price}
          />
        ))}

        {!error && events.length > 0 && categoryEvents.length === 0 && (
          <p>Bu kategoride henüz etkinlik yok.</p>
        )}
      </div>
    </section>
  );
}

export default CategoryEvents;