export interface Boardgame {
    id: string;
    name: string;  
    publisher?: string;  
    year_received?: number;  
    year_release?: number;  
    players_min?: number;  
    players_max?: number;  
    coop: boolean;  
    comp: boolean;  
    kids: boolean;  
    base: boolean;  
    expansion: boolean; 
    created_at: string;
    updated_at: string;
    active: boolean;
    copies: number;
}

export interface UserTeachesGame {
    id: string;
    user_id: string;
    boardgame_id: string;
    created_at: string;
}

export interface BoardgameWithTeachers extends Boardgame {
    canTeach?: boolean;
    teachers?: Profile[];
}

export interface Profile {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'monitor' | 'user';

}