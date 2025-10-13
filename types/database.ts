export interface Profile {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'monitor' | 'user';
}

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
    active: boolean;
    copies: number;
    created_at: string;
    updated_at: string;
}

export interface UserTeachesGame {
    id: string;
    user_id: string;
    boardgame_id: string;
    created_at: string;
}

export interface GameLoan {
    id: string;
    boardgame_id: string;
    user_id: string;
    borrowed_at: string;
    due_date?: string;
    returned_at?: string;
    created_at: string;
}

export interface BoardgameWithTeachers extends Boardgame {
    canTeach?: boolean;
    teachers?: Profile[];
    isLoaned?: boolean;
    loanedTo?: Profile;
    loanedBy?: string; 
    borrowedAt?: string;
    dueDate?: string;
}