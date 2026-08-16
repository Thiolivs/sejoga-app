// ============================================================
// lib/distribuicao.ts
// Algoritmo de distribuição de monitores por data de treinamento.
// Função pura, sem dependências de React/Supabase.
// ============================================================

export type Shift = 'morning' | 'afternoon' | 'night';

export interface MonitorAvailability {
    monitorId: string;
    name: string;
    availability: Record<string, Set<Shift>>; // dateId -> turnos marcados
}

export interface TrainingInOption {
    dateId: string;
    shifts: Partial<Record<Shift, { id: string; name: string }[]>>; // turno -> monitores
    monitorIds: string[];
}

export interface DistributionOption {
    trainings: TrainingInOption[];
    unassigned: string[]; // nomes sem encaixe
    score: number;
}

const ALL_SHIFTS: Shift[] = ['morning', 'afternoon', 'night'];

function montarData(
    dateId: string,
    monitorIds: string[],
    porMonitor: Map<string, MonitorAvailability>
): { shifts: Partial<Record<Shift, { id: string; name: string }[]>>; validos: string[] } {
    const contagemTurno: Record<Shift, string[]> = { morning: [], afternoon: [], night: [] };
    for (const mId of monitorIds) {
        const av = porMonitor.get(mId);
        if (!av) continue;
        const turnos = av.availability[dateId];
        if (!turnos) continue;
        for (const s of ALL_SHIFTS) {
            if (turnos.has(s)) contagemTurno[s].push(mId);
        }
    }

    const shifts: Partial<Record<Shift, { id: string; name: string }[]>> = {};
    for (const s of ALL_SHIFTS) {
        if (contagemTurno[s].length >= 2) {
            shifts[s] = contagemTurno[s].map(id => ({
                id,
                name: porMonitor.get(id)!.name,
            }));
        }
    }

    const turnosQueAcontecem = Object.keys(shifts) as Shift[];
    const validos: string[] = [];
    for (const mId of monitorIds) {
        const av = porMonitor.get(mId);
        if (!av) continue;
        const turnos = av.availability[dateId];
        if (!turnos) continue;
        const temCompanhia = turnosQueAcontecem.some(s => turnos.has(s));
        if (temCompanhia) validos.push(mId);
    }

    return { shifts, validos };
}

function gerarUma(
    ordemDatas: string[],
    monitores: MonitorAvailability[],
    porMonitor: Map<string, MonitorAvailability>
): DistributionOption {
    const alocado = new Set<string>();
    const trainings: TrainingInOption[] = [];

    for (const dateId of ordemDatas) {
        const candidatos = monitores
            .filter(m => !alocado.has(m.monitorId) && m.availability[dateId])
            .map(m => m.monitorId);

        if (candidatos.length < 2) continue;

        const { shifts, validos } = montarData(dateId, candidatos, porMonitor);

        if (validos.length >= 2) {
            validos.forEach(id => alocado.add(id));
            trainings.push({ dateId, shifts, monitorIds: validos });
        }
    }

    const unassigned = monitores
        .filter(m => !alocado.has(m.monitorId))
        .map(m => m.name);

    const score = trainings.reduce((acc, t) => acc + t.monitorIds.length * t.monitorIds.length, 0);

    return { trainings, unassigned, score };
}

export function gerarOpcoes(
    monitores: MonitorAvailability[],
    todasAsDatas: string[],
    maxOpcoes = 5
): DistributionOption[] {
    const porMonitor = new Map<string, MonitorAvailability>();
    monitores.forEach(m => porMonitor.set(m.monitorId, m));

    const popularidade = new Map<string, number>();
    todasAsDatas.forEach(d => {
        const n = monitores.filter(m => m.availability[d]).length;
        popularidade.set(d, n);
    });

    const ordens: string[][] = [];
    ordens.push([...todasAsDatas].sort((a, b) => (popularidade.get(b)! - popularidade.get(a)!)));
    ordens.push([...todasAsDatas].sort((a, b) => (popularidade.get(a)! - popularidade.get(b)!)));

    const base = [...todasAsDatas].sort((a, b) => (popularidade.get(b)! - popularidade.get(a)!));
    for (let i = 1; i < base.length && ordens.length < maxOpcoes * 3; i++) {
        ordens.push([...base.slice(i), ...base.slice(0, i)]);
    }

    const vistos = new Set<string>();
    const opcoes: DistributionOption[] = [];

    for (const ordem of ordens) {
        const opt = gerarUma(ordem, monitores, porMonitor);
        if (opt.trainings.length === 0) continue;

        const chave = opt.trainings
            .map(t => `${t.dateId}:${[...t.monitorIds].sort().join(',')}`)
            .sort()
            .join('|');

        if (vistos.has(chave)) continue;
        vistos.add(chave);
        opcoes.push(opt);
    }

    opcoes.sort((a, b) => {
        if (a.unassigned.length !== b.unassigned.length) {
            return a.unassigned.length - b.unassigned.length;
        }
        return b.score - a.score;
    });

    return opcoes.slice(0, maxOpcoes);
}