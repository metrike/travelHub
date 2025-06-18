// src/pages/TopDestinations.tsx
import { useEffect, useState } from 'react';

type Stat = {
    city:      string;
    count:     number;
    avgPrice:  number;
};

export default function TopDestinations() {
    const [limit, setLimit]   = useState(5);
    const [stats, setStats]   = useState<Stat[]>([]);
    const [loading, setLoad]  = useState(false);
    const [error,   setErr ]  = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            setLoad(true); setErr('');
            try {
                const url  = `http://localhost:8000/stats/top-destinations?limit=${limit}`;
                const data = await (await fetch(url)).json();
                setStats(data);
            } catch (e:any) { setErr(e.message); }
            finally        { setLoad(false); }
        };
        fetchStats();
    }, [limit]);

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8">Top destinations</h1>

                {/* ---- Sélecteur de limite ---- */}
                <label className="block mb-6 text-zinc-300">
                    Nombre de destinations
                    <select
                        value={limit}
                        onChange={e => setLimit(Number(e.target.value))}
                        className="ml-3 bg-zinc-800 border border-zinc-600 p-2 rounded"
                    >
                        {[3,5,10,20].map(n => <option key={n}>{n}</option>)}
                    </select>
                </label>

                {/* ---- Contenu ---- */}
                {loading && <p className="text-center text-zinc-400">Chargement…</p>}
                {error   && <p className="text-center text-red-400">{error}</p>}

                {!loading && !error && (
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                        <tr className="text-zinc-400">
                            <th className="w-12">#</th>
                            <th>Ville</th>
                            <th>Nb offres</th>
                            <th>Prix moyen (€)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {stats.map((s, i) => (
                            <tr key={s.city} className="bg-zinc-800 rounded">
                                <td className="p-3 rounded-l-lg">{i + 1}</td>
                                <td className="p-3 font-medium">{s.city}</td>
                                <td className="p-3">{s.count}</td>
                                <td className="p-3 rounded-r-lg">{s.avgPrice.toFixed(1)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {!loading && !error && stats.length === 0 && (
                    <p className="text-center text-zinc-500">Aucune donnée disponible.</p>
                )}
            </div>
        </div>
    );
}
