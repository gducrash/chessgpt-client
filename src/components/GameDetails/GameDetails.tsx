import { useRef } from 'react';
import cn from 'classnames';

import classes from './GameDetails.module.scss';
import { USER_COLORS, NONE_COLOR } from '../../util/constants';

import iconKey from '../../assets/icons/iconKey.svg';
import iconServer from '../../assets/icons/iconServer.svg';
import iconUser from '../../assets/icons/iconUser.svg';

type GameDetailsProps = {
    sessionId: string;
    serverId?: number;
    user?: string;
}

type InfoBlockRowProps = {
    icon: string;
    color: string;
    text: string;
    title: string;
    primary?: boolean;
    copyable?: boolean;
}

const GameDetails = ({ sessionId, serverId, user }: GameDetailsProps) => {
    
    const copyTimerRef = useRef<number|null>(null);

    const getUserColor = (user?: string) => {
        if (!user) return NONE_COLOR;

        let sum = 0;
        for (let i = 0; i < user.length; i++) {
            sum += user.charCodeAt(i);
        }
        return USER_COLORS[sum % USER_COLORS.length];
    }

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
                <div className={classes.row}>
                    <InfoBlockRow icon={iconServer} color={NONE_COLOR} text={serverId ? "Server #" + serverId.toString() : "None"} title="Server ID" />
                    <InfoBlockRow icon={iconUser} color={getUserColor(user)} text={user ?? "None"} title="User" />
                </div>
            </div>
        </div>    
    );

}

export default GameDetails;