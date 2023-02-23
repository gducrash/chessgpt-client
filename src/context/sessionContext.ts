import { createContext, MutableRefObject } from 'react';
import { ServerError } from '../hooks/useServer';
import { GameSessionData } from '../util/types';

export type SessionContextType = {
    id: string;
    setId: (id: string) => void;
    data: GameSessionData|null;
    setData: (data: GameSessionData|null) => void;
    error: ServerError|null;
    setError: (error: ServerError|null) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    sounds: any;
    playerMove: string;
    setPlayerMove: (move: string) => void;
    boardPrevState?: MutableRefObject<any|null>;
}

export const SessionContext = createContext<SessionContextType>({
    id: '',
    setId: () => {},
    data: null,
    setData: () => {},
    error: null,
    setError: () => {},
    loading: false,
    setLoading: () => {},
    sounds: {},
    playerMove: '',
    setPlayerMove: () => {},
});
