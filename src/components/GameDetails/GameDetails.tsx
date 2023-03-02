import { useRef } from 'react';
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
    primary?: boolean;
    copyable?: boolean;
}

const GameDetails = ({ sessionId }: GameDetailsProps) => {
    
    const copyTimerRef = useRef<number|null>(null);

    const InfoBlockRow = ({ 
        icon, color, text, title,
        primary, copyable
    }: InfoBlockRowProps) => (
        <div className={classes.infoRow} title={title}>
            <div className={classes.infoRowIcon} style={{ background: color }}>
                <img src={icon} alt="" draggable={false} />
            </div>
            <span className={cn(classes.infoRowText, {
                [classes.primary]: primary,
            })}>{text}</span>
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
        </div>
    );

    return (
        <div className={classes.container}>
            <div className={classes.infoBlock}>
                <InfoBlockRow icon={iconKey} color="#10a37f" text={sessionId} title="Session ID" primary copyable />
            </div>
        </div>    
    );

}

export default GameDetails;