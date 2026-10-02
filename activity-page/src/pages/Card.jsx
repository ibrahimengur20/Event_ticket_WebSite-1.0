import { Link } from "react-router-dom";

function Card(props) {
  return (
    <article className="card">
      <img src={props.image} alt={props.name} />

      <div className="card-content">
        <p className="card-meta">
          {props.date} <span>•</span> {props.location}
        </p>

        <h3>{props.name}</h3>
        <p className="card-price">
          {props.price} TL’den başlayan fiyatlarla
        </p>

        <Link className="card-button" to={`/events/${props.id}`}>
          İncele
        </Link>
      </div>
    </article>
  );
}

export default Card;