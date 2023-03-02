import cn from 'classnames';

import classes from './ResponseCard.module.scss';
import botAvatar  from '../../assets/icons/logoChatgpt.svg';
import userAvatar from '../../assets/icons/userAvatar.svg';

type ResponseCardProps = {
    bot?: boolean;
    text: string;
    textCount?: number;
    loading?: boolean;
    disabled?: boolean;
    parseError?: boolean;
    animating?: boolean;
}

const ResponseCard = ({ 
    bot = false, 
    text, 
    textCount = 0,
    loading, 
    disabled, 
    parseError,
    animating,
}: ResponseCardProps) => {

    return (
        <div className={cn(classes.card, {
            [classes.bot]: bot,
            [classes.loading]: loading,
            [classes.disabled]: disabled,
            [classes.error]: parseError
        })}>
            <div className={classes.col}>
                <img src={bot ? botAvatar : userAvatar} alt="Avatar" className={classes.avatar} draggable={false} />
                <div className={cn(classes.text, {
                    [classes.animating]: animating
                })}>
                    {text.split(' ').map((word, index) => (
                        <span key={textCount.toString() + ", " + index.toString()} style={{
                            animationDelay: `${index * 0.1}s`
                        }}>{word + " "}</span>
                    ))}
                </div>
            </div>

            { loading && <div className={classes.loading}>
                <div className={classes.loader}></div>
                <span>ChatGPT is thinking...</span>
            </div> }
            { parseError && <div className={classes.error}>
                <span>
                    There was an error parsing the above response.
                    Try again or make a different move.
                </span>
            </div> }
        </div>
    );

}

export default ResponseCard;