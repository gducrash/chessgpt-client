import { useState, useRef } from 'react';
import cn from 'classnames';

import classes from './GameDetails.module.scss';

import iconKey from '../../assets/icons/iconKey.svg';

type GameDetailsProps = {
    sessionId: string;
}

type InfoBlockRowProps = {
    icon: string;
    color: string;
    text: string;
    title: string;
    hidden?: boolean;
    primary?: boolean;
    copyable?: boolean;
    show?: () => void;
    hide?: () => void;
}

const GameDetails = ({ sessionId }: GameDetailsProps) => {
    
    const copyTimerRef = useRef<number|null>(null);
    const [ sessionIdHidden, setSessionIdHidden ] = useState(true);

    const InfoBlockRow = ({ 
        icon, color, text, title,
        primary, copyable, 
        hidden, show, hide,
    }: InfoBlockRowProps) => (
        <div className={classes.infoRow} title={title}>
            <div className={classes.infoRowIcon} style={{ background: color }}>
                <img src={icon} alt="" draggable={false} />
            </div>
            { hidden ? (
                <button 
                    className={cn(classes.infoRowLink)}
                    onClick={show}
                >
                    Click to reveal {title}
                </button>
            ) : (
                <span className={cn(classes.infoRowText, {
                    [classes.primary]: primary,
                })}>{text}</span>
            ) }
            { copyable && (
                <button 
                    className={classes.infoRowButton} 
                    onClick={e => {
                        navigator.clipboard.writeText(text);
                        (e.target as any).innerText = "Copied!";
                        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
                        copyTimerRef.current = setTimeout(() => 
                            (e.target as any).innerText = "Copy"
                        , 3000);
                    }}
                >
                    Copy
                </button>
            ) }
            { !hidden && hide && (
                <button 
                    className={classes.infoRowButton} 
                    onClick={hide}
                >
                    Hide
                </button>
            ) }
        </div>
    );

    return (
        <div className={classes.container}>
            <div className={classes.infoBlock}>
                <InfoBlockRow 
                    icon={iconKey} 
                    color="#10a37f" 
                    text={sessionId} 
                    title="Session ID" 
                    primary copyable
                    hidden={sessionIdHidden}
                    show={() => setSessionIdHidden(false)}
                    hide={() => setSessionIdHidden(true)}
                />
            </div>
        </div>    
    );

}

export default GameDetails;