import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type Offer from "../type/offer.ts";

const CODES = [
    'PAR','TYO','NYC','ROM','BER','MAD',
    'LON','YUL','CAS','AMS','FRA','LIS','IST'
];

function Offers() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (from.length !== 3 || to.length !== 3) {
            setOffers([]);
            return;
        }

        const fetchOffers = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:8000/offers?from=${from}&to=${to}&limit=10`
                );
                const data = await res.json();
                setOffers(data);
            } catch (err) {
                console.error('Erreur de chargement des offres:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [from, to]);

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8">Offres de Voyage</h1>

                <div className="flex gap-4 mb-8">
                    <input
                        list="codes"
                        className="flex-1 p-3 rounded bg-zinc-800 border border-zinc-600"
                        placeholder="Départ (ex : PAR)"
                        value={from}
                        onChange={e => setFrom(e.target.value.toUpperCase())}
                    />
                    <input
                        list="codes"
                        className="flex-1 p-3 rounded bg-zinc-800 border border-zinc-600"
                        placeholder="Arrivée (ex : TYO)"
                        value={to}
                        onChange={e => setTo(e.target.value.toUpperCase())}
                    />
                    <datalist id="codes">
                        {CODES.map(code => (
                            <option key={code} value={code} />
                        ))}
                    </datalist>
                </div>

                {loading ? (
                    <p className="text-center text-zinc-400">Chargement en cours…</p>
                ) : offers.length === 0 ? (
                    <p className="text-center text-zinc-500">
                        Aucune offre trouvée pour {from || '???'} ➜ {to || '???'}
                    </p>
                ) : (
                    <div className="grid gap-4">
                        {offers.map(offer => (
                            <div
                                key={offer._id}
                                className="bg-zinc-800 p-4 rounded shadow hover:shadow-lg transition"
                            >
                                <h2 className="text-xl font-semibold">
                                    {offer.from} ➜ {offer.to}
                                </h2>
                                <p className="text-zinc-300">
                                    Prix : <strong>{offer.price} {offer.currency}</strong>
                                </p>
                                {offer.provider && (
                                    <p className="text-zinc-400">Compagnie : {offer.provider}</p>
                                )}
                                <Link
                                    to={`/offers/${offer._id}`}
                                    className="inline-block mt-2 text-teal-400 hover:underline"
                                >
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

export default Offers;
