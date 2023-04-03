import MoveRatingDiv from "./MoveRatingDiv";
import { GameState, Move, MoveAndRating } from "./Types";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Gameboard(props: {gameState: GameState, moveAndRating: MoveAndRating | null, gameBusy: boolean, makeMove: (move: Move) => any}) {
    return (
        <table className='gameboard'>
            <tbody>
                {
                    props.gameState.map((row, rowindex) => {
                        return (
                            <tr key={rowindex}>
                                {
                                    row.map((cell, columnindex) => {
                                        return (
                                            <td className={props.gameBusy ? "disabled" : ""} key={columnindex} onClick={() => {
                                                props.makeMove({
                                                    row: rowindex,
                                                    column: columnindex
                                                });
                                            }}>
                                                <div>
                                                    {
                                                        {
                                                            '-': <></>,
                                                            'o': <i className="fa-regular fa-circle"/>,
                                                            'x': <i className="fa-solid fa-xmark"/>
                                                        }[cell]
                                                    }
                                                    {
                                                        (props.moveAndRating?.move.column == columnindex && props.moveAndRating?.move.row == rowindex) && (
                                                            <MoveRatingDiv rating={props.moveAndRating.rating}></MoveRatingDiv>
                                                        )
                                                    }
                                                </div>
                                            </td>
                                        );
                                    })
                                }
                            </tr>
                        );
                    })
                }
            </tbody>
        </table>
    )
}
