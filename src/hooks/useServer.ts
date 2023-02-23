import axios from "axios";

import { SERVER } from "../util/constants";
import { GameMove } from "../util/types";

import { SessionContextType } from "../context/sessionContext";
import { generateMoveString } from "../util/functions";

export type ServerError = {
    type: string;
    message: string;
    code: number;
}

export const useServer = (context: SessionContextType) => {

    const { 
        id, setId, data, setData, 
        setError, setLoading, sounds,
        setPlayerMove, boardPrevState
    } = context;

    const post = async (endpoint: string, data: any = {}) => {
        return await axios.post(SERVER.url + endpoint, data, {
            timeout: 30000, // 30 seconds
        });
    }

    const error = (type: string, err: any) => {
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

        let res;
        try {
            res = await post(SERVER.endpoints.session.create());
        } catch (err) {
            error('createSession', err);
        }

        setLoading(false);

        if (!res) {
            sounds.error?.();
            return null;
        }

        if (res.status === 200) {
            setId(res.data.id);
            setData(res.data.session);
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

    const makeMove = async (move: GameMove) => {
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
            setData({ ...data, ...res.data });
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