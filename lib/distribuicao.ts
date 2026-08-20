// ============================================================
// lib/distribuicao.ts
// Algoritmo de distribuição de monitores por data de treinamento.
// Máximo 2 datas por opção, com geração agressiva de variações equilibradas.
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
    porMonitor: Map<string, MonitorAvailability>,
    maxDatas: number = 2
): DistributionOption {
    const alocado = new Set<string>();
    const trainings: TrainingInOption[] = [];

    for (const dateId of ordemDatas) {
        // Para na primeira vez que chegaria a 3 datas
        if (trainings.length >= maxDatas) break;

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

/**
 * Calcula a variância do número de monitores por data.
 * Menor variância = distribuição mais igualitária.
 */
function calcularVariancia(tamanhosPorData: number[]): number {
    if (tamanhosPorData.length === 0) return 0;
    const media = tamanhosPorData.reduce((a, b) => a + b, 0) / tamanhosPorData.length;
    const somaDosQuadrados = tamanhosPorData.reduce((acc, v) => acc + Math.pow(v - media, 2), 0);
    return somaDosQuadrados / tamanhosPorData.length;
}

/**
 * Gera variações de uma opção com 2 datas testando todas as redistribuições equilibradas.
 * Para uma opção com 2 datas, tenta todas as divisões de monitores que mantenham >=2 em cada.
 */
function gerarVariacoesDuasDatas(
    option: DistributionOption,
    monitores: MonitorAvailability[],
    porMonitor: Map<string, MonitorAvailability>
): DistributionOption[] {
    if (option.trainings.length !== 2) return [];

    const training1 = option.trainings[0];
    const training2 = option.trainings[1];
    const date1 = training1.dateId;
    const date2 = training2.dateId;

    // Monitores que podem estar em ambas as datas
    const allMonitors = [...training1.monitorIds, ...training2.monitorIds];
    const canBeInBoth = allMonitors.filter(mId => {
        const av = porMonitor.get(mId);
        return av && av.availability[date1] && av.availability[date2];
    });

    const variacoes: DistributionOption[] = [];

    // Se há monitores que podem estar em ambas as datas, tenta redistribuir
    if (canBeInBoth.length > 0) {
        const totalMonitors = allMonitors.length;
        const mustInDate1 = training1.monitorIds.filter(mId => !canBeInBoth.includes(mId));
        const mustInDate2 = training2.monitorIds.filter(mId => !canBeInBoth.includes(mId));

        // Mínimo que cada data precisa (apenas os "fixos")
        const minDate1 = Math.max(2, mustInDate1.length);
        const minDate2 = Math.max(2, mustInDate2.length);

        // Tenta todas as divisões equilibradas
        for (let countDate1 = minDate1; countDate1 <= totalMonitors - 2; countDate1++) {
            const countDate2 = totalMonitors - countDate1;
            if (countDate2 < 2) continue; // Date2 precisa de >=2

            // Calcula quantos monitores flexíveis cada data precisa
            const flexibleNeededDate1 = countDate1 - mustInDate1.length;
            const flexibleNeededDate2 = countDate2 - mustInDate2.length;

            if (flexibleNeededDate1 < 0 || flexibleNeededDate2 < 0) continue;
            if (flexibleNeededDate1 + flexibleNeededDate2 !== canBeInBoth.length) continue;

            // Cria essa divisão específica
            const newIds1 = [
                ...mustInDate1,
                ...canBeInBoth.slice(0, flexibleNeededDate1)
            ];
            const newIds2 = [
                ...mustInDate2,
                ...canBeInBoth.slice(flexibleNeededDate1)
            ];

            if (newIds1.length >= 2 && newIds2.length >= 2) {
                const { shifts: shifts1 } = montarData(date1, newIds1, porMonitor);
                const { shifts: shifts2 } = montarData(date2, newIds2, porMonitor);

                const trainings = [
                    { dateId: date1, shifts: shifts1, monitorIds: newIds1 },
                    { dateId: date2, shifts: shifts2, monitorIds: newIds2 }
                ];

                const unassigned = monitores
                    .filter(m => !trainings.some(t => t.monitorIds.includes(m.monitorId)))
                    .map(m => m.name);

                const score = trainings.reduce((acc, t) => acc + t.monitorIds.length * t.monitorIds.length, 0);

                variacoes.push({ trainings, unassigned, score });
            }
        }
    }

    return variacoes;
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

    // Gerar opções base (máximo 2 datas)
    for (const ordem of ordens) {
        const opt = gerarUma(ordem, monitores, porMonitor, 2);
        if (opt.trainings.length === 0) continue;

        const chave = opt.trainings
            .map(t => `${t.dateId}:${[...t.monitorIds].sort().join(',')}`)
            .sort()
            .join('|');

        if (vistos.has(chave)) continue;
        vistos.add(chave);
        opcoes.push(opt);

        // Gerar variações agressivas para 2 datas
        if (opt.trainings.length === 2) {
            const variacoes = gerarVariacoesDuasDatas(opt, monitores, porMonitor);
            for (const var_opt of variacoes) {
                const var_chave = var_opt.trainings
                    .map(t => `${t.dateId}:${[...t.monitorIds].sort().join(',')}`)
                    .sort()
                    .join('|');

                if (!vistos.has(var_chave)) {
                    vistos.add(var_chave);
                    opcoes.push(var_opt);
                }
            }
        }
    }

    // Ranking ajustado: prioriza igualitarismo e menos datas
    opcoes.sort((a, b) => {
        // Prioridade 1: Menos monitores não alocados (unassigned)
        if (a.unassigned.length !== b.unassigned.length) {
            return a.unassigned.length - b.unassigned.length;
        }

        // Prioridade 2: Menor número de datas
        if (a.trainings.length !== b.trainings.length) {
            return a.trainings.length - b.trainings.length;
        }

        // Prioridade 3: Distribuição mais igualitária entre datas
        const tamanhosPorDataA = a.trainings.map(t => t.monitorIds.length);
        const tamanhosPorDataB = b.trainings.map(t => t.monitorIds.length);
        const varianciaA = calcularVariancia(tamanhosPorDataA);
        const varianciaB = calcularVariancia(tamanhosPorDataB);
        return varianciaA - varianciaB;
    });

    return opcoes.slice(0, maxOpcoes);
}