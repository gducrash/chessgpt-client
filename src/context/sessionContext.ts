import { createContext, MutableRefObject } from 'react';
import { UseHistoryReturn } from '../hooks/useHistory';
import { ServerError } from '../hooks/useServer';
import { Board, GameSessionData } from '../util/types';

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
    pencilEnabled: boolean;
    setPencilEnabled: (enabled: boolean) => void;
    boardPrevState?: MutableRefObject<any|null>;
    boardHistory?: UseHistoryReturn<Board>;
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
    pencilEnabled: false,
    setPencilEnabled: () => {},
});
