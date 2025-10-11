export interface Boardgame {
    id: string;
    name: string;  // era "nome"
    publisher?: string;  // era "editora"
    year_received?: number;  // era "ano_recebimento"
    year_release?: number;  // era "ano_lancamento"
    players_min?: number;  // era "jogadores_min"
    players_max?: number;  // era "jogadores_max"
    coop: boolean;  // era "cooperativo"
    comp: boolean;  // era "competitivo"
    kids: boolean;  // era "infantil"
    base: boolean;  // era "jogo_base"
    expansion: boolean;  // era "expansao"
    created_at: string;
    updated_at: string;
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
}