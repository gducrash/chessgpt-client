import { useState, useRef, useContext } from 'react';

import { useServer } from '../../hooks/useServer';
import { SessionContext } from '../../context/sessionContext';
import Button from '../Button';
import DialogBox from '../DialogBox';

import iconPlus from '../../assets/icons/iconPlus.svg';
import iconResign from '../../assets/icons/iconResign.svg';
import iconReconnect from '../../assets/icons/iconReconnect.svg';

import classes from './GameManager.module.scss';

type GameManagerProps = {
    gameStarted: boolean;
    canReconnect: boolean;
    loading?: boolean;
}

const GameManager = ({ 
    gameStarted, 
    canReconnect,
    loading = false,
}: GameManagerProps) => {

    const sessionContext = useContext(SessionContext);
    const { createSession, makeMove, getLatestMove } = useServer(sessionContext);

    const resign = () => {
        makeMove({
            piece: 'king',
            resign: true,
        } as any);
    }

    const loadSession = async () => {
        setDialogLoadError(null);

        const id = sessionIdInputRef.current?.value;
        if (!id) return;

        setTimeout(async () => {
            setDialogLoadLoading(true);
            const [_res, err] = await getLatestMove(id);
            setDialogLoadLoading(false);
            if (err) {
                setDialogLoadError(err);
            } else {
                sessionContext.sounds.gameStart?.();
                closeDialogLoad();
            }
        }, 0);
    }

    const reconnect = async () => {
        setDialogLoadError(null);
        setTimeout(async () => {
            await getLatestMove();
        }, 0);
    }

    const [ dialogLoadOpen, setDialogLoadOpen ] = useState(false);
    const [ dialogLoadClosing, setDialogLoadClosing ] = useState(false);
    const [ dialogLoadLoading, setDialogLoadLoading ] = useState(false);
    const [ dialogLoadError, setDialogLoadError ] = useState<string|null>(null);
    const sessionIdInputRef = useRef<HTMLInputElement>(null);
    const closeDialogLoad = () => {
        setDialogLoadClosing(true);
        setTimeout(() => {
            setDialogLoadOpen(false);
            setDialogLoadClosing(false);
        }, 200);
    }

    const [ dialogResignOpen, setDialogResignOpen ] = useState(false);
    const [ dialogResignClosing, setDialogResignClosing ] = useState(false);


    const dialogRestoreSession = (
        <DialogBox
            title="Load Existing Session" canCloseOutside
            buttons={[
                { text: "Load", onClick: () => loadSession(), loading: dialogLoadLoading },
                { text: "Cancel", variation: "secondary", closeDialog: true, disabled: dialogLoadLoading },
            ]}
            onClose={closeDialogLoad}
            closing={dialogLoadClosing}
            error={dialogLoadError ?? undefined}
        >
            <p>Enter the session ID to load your existing session. If the session doesn't exist, either the game has ended or the session ID is invalid.</p>
            <input type="text" placeholder="Session ID" ref={sessionIdInputRef} />
        </DialogBox>
    );

    const resignConfirmDialog = (
        <DialogBox
            title="Confirm Resign" canCloseOutside
            buttons={[
                { text: "Yes", variation: 'warn', onClick: () => {
                    resign();
                }, closeDialog: true },
                { text: "No", variation: "secondary", closeDialog: true },
            ]}
            onClose={() => {
                setDialogResignClosing(true);
                setTimeout(() => {
                    setDialogResignOpen(false);
                    setDialogResignClosing(false);
                }, 200);
            }}
            closing={dialogResignClosing}
        >
            <p>Are you sure you want to resign?</p>
        </DialogBox>
    );

    return (
        <>
            { dialogLoadOpen && dialogRestoreSession }
            { dialogResignOpen && resignConfirmDialog }
        
            <div className={classes.container}>
                {gameStarted ? (<>
                    <Button
                        text="Resign" variation='warn' icon={iconResign}
                        disabled={loading} onClick={() => setDialogResignOpen(true)}
                    />
                    { canReconnect && (
                        <Button
                            text="Reconnect" variation='secondary' icon={iconReconnect}
                            loading={loading} onClick={reconnect}
                        />
                    ) }
                </>): (<>
                    <Button
                        text="New Game" icon={iconPlus}
                        loading={loading}
                        onClick={createSession}
                    />
                    <Button
                        text="Restore Session" variation='secondary'
                        disabled={loading}
                        onClick={() =>  setDialogLoadOpen(true)}
                    />
                </>)}      
            </div>
        </>
    );

}

export default GameManager;
