// src/pages/OfferDetail.tsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import type Offer from "../type/offer.ts";

export default function OfferDetail() {
    const { id } = useParams<{ id: string }>();
    const [offer, setOffer]   = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get<Offer>(`http://localhost:8000/offers/${id}`);
                setOffer(res.data);
            } catch (err) {
                console.error('❌ fetch detail', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <p className="p-8">Chargement…</p>;
    if (!offer)   return <p className="p-8">Offre introuvable.</p>;

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6">
            <Link to="/offers" className="text-blue-600 hover:underline">&larr; Retour</Link>

            <h1 className="text-2xl font-bold">
                {offer.from} &rarr; {offer.to}
            </h1>

            <div className="max-w-md mx-auto">
                <div className="grid grid-cols-2 gap-4 text-sm justify-items-center text-center">
                    <div>
                        <span className="font-medium">Compagnie :</span><br />
                        {offer.provider}
                    </div>
                    <div>
                        <span className="font-medium">Prix :</span><br />
                        {offer.price} {offer.currency}
                    </div>
                    <div>
                        <span className="font-medium">Départ :</span><br />
                        {new Date(offer.departDate).toLocaleDateString()}
                    </div>
                    <div>
                        <span className="font-medium">Retour :</span><br />
                        {new Date(offer.returnDate).toLocaleDateString()}
                    </div>
                </div>
            </div>


            {/* Legs */}
            {offer.legs && offer.legs.length > 0 && (
                <div>
                    <h2 className="font-semibold mb-2">Segments de vol</h2>
                    <table className="w-full text-sm border">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2">#</th><th>Départ</th><th>Arrivée</th><th>Durée (min)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {offer.legs.map((l, idx) => (
                            <tr key={idx} className="text-center border-t">
                                <td className="p-1">{l.flightNum}</td>
                                <td>{l.dep}</td>
                                <td>{l.arr}</td>
                                <td>{l.duration}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Hotel */}
            {offer.hotel && (
                <div className="border p-4 rounded">
                    <h2 className="font-semibold mb-1">Hôtel</h2>
                    <p>{offer.hotel.name} • {offer.hotel.nights} nuits • {offer.hotel.price} {offer.currency}</p>
                </div>
            )}

            {/* Activity */}
            {offer.activity && (
                <div className="border p-4 rounded">
                    <h2 className="font-semibold mb-1">Activité</h2>
                    <p>{offer.activity.title} • {offer.activity.price} {offer.currency}</p>
                </div>
            )}

            {/* Related */}
            {offer.relatedOffers && offer.relatedOffers.length > 0 && (
                <div>
                    <h2 className="font-semibold mb-2">Offres similaires</h2>
                    <ul className="list-disc ml-6 space-y-1">
                        {offer.relatedOffers.map(id => (
                            <li key={id}>
                                <Link to={`/offers/${id}`} className="text-blue-600 hover:underline">
                                    Voir l’offre&nbsp;{id.slice(-6)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
