export interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'admin' | 'monitor' | 'user';
}

export interface GameMechanic {
    id: string;
    name: string;
    slug: string;
    description?: string;
    type: 'mechanic' | 'category' | 'mode';
    icon?: string;
    created_at: string;
}

export interface BoardgameMechanic {
    id: string;
    boardgame_id: string;
    mechanic_id: string;
    created_at: string;
}

export interface Boardgame {
    id: string;
    name: string;
    publisher?: string;
    year_received?: number;
    year_release?: number;
    players_min?: number;
    players_max?: number;
    expansion?: boolean;
    active?: boolean;
    copies?: number;
    created_at?: string;
    updated_at?: string;
    mechanics?: GameMechanic[];
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
    mechanics?: GameMechanic[];
}

export interface Event {
    id: string;
    name: string;
    description?: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TeachingSession {
    id: string;
    event_id: string;
    monitor_id: string;
    boardgame_id: string;
    players_count: number;
    notes?: string;
    session_date: string;
    created_at: string;
}

export interface TeachingSessionWithDetails extends TeachingSession {
    monitor?: Profile;
    boardgame?: Boardgame;
    event?: Event;
}

export interface Training {
    id: string;
    training_date: string;
    location: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TrainingAvailability {
    id: string;
    training_id: string;
    user_id: string;
    shift: 'morning' | 'afternoon' | 'night';
    created_at: string;
}

export interface TrainingWithAvailability extends Training {
    availabilities?: (TrainingAvailability & { profile?: Profile })[];
}