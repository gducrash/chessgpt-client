import cn from 'classnames';
import classes from './TurnInfo.module.scss';

type TurnInfoProps = {
    turn: "white" | "black";
}

const TurnInfo = ({ turn }: TurnInfoProps) => (
    <div className={classes.container}>
        <div className={cn(classes.turn, {
            [classes.white]: turn === "white",
            [classes.black]: turn === "black"
        })} />
        <span>
            {turn === "white" ? "White" : "Black"} to move
        </span>
    </div>
);

export default TurnInfo;