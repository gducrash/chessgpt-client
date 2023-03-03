import { useState, useRef, useEffect } from 'react';
import cn from 'classnames';

import classes from './GameDetails.module.scss';

import iconKey from '../../assets/icons/iconKey.svg';
import iconBack from '../../assets/icons/iconBack.svg';
import iconForward from '../../assets/icons/iconForward.svg';

import Button from '../Button';

type GameDetailsProps = {
    sessionId: string;
    goBack?: () => void;
    goForward?: () => void;
    canGoBack?: boolean;
    canGoForward?: boolean;
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

const GameDetails = ({ 
    sessionId,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
}: GameDetailsProps) => {
    
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

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' && goBack) {
            e.preventDefault();
            goBack();
        }
        if (e.key === 'ArrowRight' && goForward) {
            e.preventDefault();
            goForward();
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [goBack, goForward]);


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
            <div className={classes.controlsBlock}>
                <Button
                    text="" icon={iconBack}
                    size='small'
                    variation='secondary' 
                    onClick={goBack}
                    disabled={!canGoBack}
                />
                <Button
                    text="" icon={iconForward}
                    size='small'
                    variation='secondary'
                    onClick={goForward}
                    disabled={!canGoForward}
                />
            </div>
        </div>    
    );

}

export default GameDetails;