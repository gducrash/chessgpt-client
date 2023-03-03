import axios from "axios";

import { DEFAULT_BOARD, SERVER } from "../util/constants";
import { GameMove, GameSessionData } from "../util/types";

import { SessionContextType } from "../context/sessionContext";
import { generateMoveString } from "../util/functions";
import { isCheckmate } from "../util/moves";

export type ServerError = {
    type: string;
    message: string;
    code: number;
}

export const useServer = (context: SessionContextType) => {

    const { 
        id, setId, data, setData, 
        setError, setLoading, sounds,
        setPlayerMove, setPencilEnabled,
        boardPrevState, boardHistory,
    } = context;

    const post = async (endpoint: string, data: any = {}) => {
        return await axios.post(SERVER.url + endpoint, data, {
            timeout: 30000, // 30 seconds
        });
    }

    const error = (type: string, err: any) => {
        sounds.stopAllSounds?.();
        sounds.error?.();
        const errorText = (err as any)?.response?.data?.error ?? 'Network error';
        setError({
            type,
            message: errorText,
            code: (err as any)?.responsestatus,
        });

        if (errorText === 'Session not found') {
            setTimeout(() => {
                setId('');
                setData(null);
            }, 0);
        }

        // if boardPrevState is set, set board state to it
        if (boardPrevState?.current) {
            setTimeout(() => {
                setData({ ...data, board: boardPrevState.current } as any);
                boardPrevState.current = null;
            }, 0);
        }
    }

    const setTurnTo = (turn: 'white'|'black') => {
        setData({ ...data, turn: turn } as any);
    }

    const createSession = async () => {
        setError(null);
        setLoading(true);
        setPencilEnabled(false);
        boardHistory?.clearHistory(DEFAULT_BOARD());

        let res;
        try {
            res = await post(SERVER.endpoints.session.create());
        } catch (err) {
            error('createSession', err);
        }

        setLoading(false);

        if (!res) {
            sounds.stopAllSounds?.();
            sounds.error?.();
            return null;
        }

        if (res.status === 200) {
            setId(res.data.id);
            setData(res.data.session);
            sounds.stopAllSounds?.();
            sounds.gameStart?.();
            return res.data.session;
        } else {
            return null;
        }
    }

    const getLatestMove = async (idOverride?: string) => {
        setError(null);
        setLoading(true);

        let res, err: any;
        try {
            res = await post(SERVER.endpoints.session.latestMove(idOverride ?? id));
        } catch (e) {
            console.log(e);
            err = (e as any)?.response?.data?.error ?? 'Network error';
            error('getLatestMove', e);
        }

        setLoading(false);
        if (!res) return [null, err];

        if (res.status === 200) {
            if (idOverride) setId(idOverride);
            setData({ ...data, ...res.data });
            return [res.data, err];
        } else {
            return [null, err];
        }
    }

    const makeMove = async (move: GameMove, nested: boolean = false) => {
        setError(null);
        setLoading(true);
        setTurnTo('black');
        setPlayerMove(generateMoveString(move));

        let res;
        
        try {
            res = await post(SERVER.endpoints.session.move(id), { move });
        } catch (err) {
            error('makeMove', err);
        };

        setLoading(false);
        setPlayerMove('');

        if (!res) {
            setTurnTo('white');
            return null;
        }

        if (res.status === 200) {
            const newData: GameSessionData = { ...data, ...res.data };
            setData(newData);

            if (newData.beforeBotResponseBoard) {
                boardHistory?.addHistory(structuredClone(newData.beforeBotResponseBoard), 0);
            }
            boardHistory?.addHistory(structuredClone(newData.board));

            if (isCheckmate(newData.board, "white") && !nested) {
                setTimeout(() => {
                    const kingPos = newData.board.items.find(p => p.piece === 'king' && p.color === 'white')?.coord;
                    makeMove({
                        piece: 'king',
                        from: kingPos ?? { x: 0, y: 0 },
                        to: kingPos ?? { x: 0, y: 0 },
                        selfCheckmate: true,
                    }, true);
                }, 0);
            }
            return res.data;
        } else {
            setTurnTo('white');
            return null;
        }
    }

    return {
        createSession,
        getLatestMove,
        makeMove,
    }

}