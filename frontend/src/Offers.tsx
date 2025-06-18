import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type Offer from '../type/offer';

const CODES = ['PAR','TYO','NYC','ROM','BER','MAD','LON','YUL','CAS','AMS','FRA','LIS','IST'];

export default function Offers() {
    const [offers,   setOffers]   = useState<Offer[]>([]);
    const [from,     setFrom]     = useState('');
    const [to,       setTo]       = useState('');
    const [query,    setQuery]    = useState('');          // ⬅️ filtre texte
    const [loading,  setLoading]  = useState(false);

    /* -------------------- Fetch -------------------- */
    useEffect(() => {
        if (from.length !== 3 || to.length !== 3) {
            setOffers([]);
            return;
        }

        const fetchOffers = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    from,
                    to,
                    limit: '10',
                    ...(query.trim() && { q: query.trim() })   // n’ajoute q= que si non vide
                });

                const res  = await fetch(`http://localhost:8000/offers?${params.toString()}`);
                const data = await res.json();
                setOffers(data);
            } catch (err) {
                console.error('Erreur de chargement:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [from, to, query]);

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8">Offres de Voyage</h1>

                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex gap-4">
                        <input list="codes" className="flex-1 p-3 rounded bg-zinc-800 border border-zinc-600"
                               placeholder="Départ (ex : PAR)"
                               value={from}
                               onChange={e => setFrom(e.target.value.toUpperCase())}/>
                        <input list="codes" className="flex-1 p-3 rounded bg-zinc-800 border border-zinc-600"
                               placeholder="Arrivée (ex : NYC)"
                               value={to}
                               onChange={e => setTo(e.target.value.toUpperCase())}/>
                    </div>

                    <input className="p-3 rounded bg-zinc-800 border border-zinc-600"
                           placeholder="Filtre texte (hôtel, activité, provider…) "
                           value={query}
                           onChange={e => setQuery(e.target.value)}/>
                </div>

                <datalist id="codes">{CODES.map(c => <option key={c} value={c}/>)}</datalist>

                {loading ? (
                    <p className="text-center text-zinc-400">Chargement…</p>
                ) : offers.length === 0 ? (
                    <p className="text-center text-zinc-500">
                        Aucune offre pour {from || '???'} ➜ {to || '???'}
                        {query && ` · filtre : “${query}”`}
                    </p>
                ) : (
                    <div className="grid gap-4">
                        {offers.map(o => (
                            <div key={o._id} className="bg-zinc-800 p-4 rounded shadow hover:shadow-lg transition">
                                <h2 className="text-xl font-semibold">{o.from} ➜ {o.to}</h2>
                                <p className="text-zinc-300">
                                    Prix : <strong>{o.price} {o.currency}</strong>
                                </p>
                                {o.provider && <p className="text-zinc-400">Compagnie : {o.provider}</p>}
                                <Link to={`/offers/${o._id}`} className="inline-block mt-2 text-teal-400 hover:underline">
                                    Voir les détails
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
