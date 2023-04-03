import { MoveRating } from "./Types";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function MoveRatingDiv(props: {rating: MoveRating}) {
    return (
        <div className={"moveRating " + props.rating}>
            {
                {
                    "great": "!",
                    "blunder": "??",
                    "mistake": "?",
                    "compelled": <i className="fa-solid fa-arrow-right"/>,
                    "book": <i className="fa-solid fa-book-open"/>,
                    "best": <i className="fa-solid fa-star"/>,
                    "missed-win": <i className="fa-solid fa-minus"/>,
                    "engine-error": <i className="fa-solid fa-bug"/>
                }[props.rating]
            }
        </div>
    )
}