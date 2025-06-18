db = db.getSiblingDB('projet');

db.offers.insertMany([
    {
        "from": "PAR",
        "to": "NYC",
        "departDate": ISODate("2025-08-05T00:00:00Z"),
        "returnDate": ISODate("2025-08-15T00:00:00Z"),
        "provider": "GlobeFly",
        "price": 700,
        "currency": "EUR",
        "legs": [{ "flightNum": "GF101", "dep": "CDG", "arr": "JFK", "duration": 480 }],
        "hotel": { "name": "Midtown Hotel", "nights": 5, "price": 450 },
        "activity": { "title": "Statue de la Liberté", "price": 80 }
    },
    {
        "from": "MAD",
        "to": "BER",
        "departDate": ISODate("2025-07-10T00:00:00Z"),
        "returnDate": ISODate("2025-07-18T00:00:00Z"),
        "provider": "IberBerlin",
        "price": 200,
        "currency": "EUR",
        "legs": [{ "flightNum": "IB202", "dep": "MAD", "arr": "BER", "duration": 180 }],
        "hotel": { "name": "Berlin Plaza", "nights": 4, "price": 320 },
        "activity": { "title": "Visite du Reichstag", "price": 30 }
    },
    {
        "from": "ROM",
        "to": "CAS",
        "departDate": ISODate("2025-09-01T00:00:00Z"),
        "returnDate": ISODate("2025-09-10T00:00:00Z"),
        "provider": "RomaAir",
        "price": 260,
        "currency": "EUR",
        "legs": [{ "flightNum": "RA333", "dep": "FCO", "arr": "CMN", "duration": 210 }],
        "hotel": { "name": "Casablanca Hotel", "nights": 6, "price": 370 },
        "activity": { "title": "Medina Tour", "price": 40 }
    },
    {
        "from": "LON",
        "to": "NYC",
        "departDate": ISODate("2025-10-12T00:00:00Z"),
        "returnDate": ISODate("2025-10-22T00:00:00Z"),
        "provider": "BritishJet",
        "price": 720,
        "currency": "EUR",
        "legs": [{ "flightNum": "BJ420", "dep": "LHR", "arr": "JFK", "duration": 500 }],
        "hotel": { "name": "Times Square Inn", "nights": 7, "price": 600 },
        "activity": { "title": "Broadway Show", "price": 90 }
    },
    {
        "from": "TYO",
        "to": "PAR",
        "departDate": ISODate("2025-11-03T00:00:00Z"),
        "returnDate": ISODate("2025-11-13T00:00:00Z"),
        "provider": "TokyoAir",
        "price": 830,
        "currency": "EUR",
        "legs": [{ "flightNum": "TA777", "dep": "NRT", "arr": "CDG", "duration": 720 }],
        "hotel": { "name": "Hôtel Louvre", "nights": 5, "price": 520 },
        "activity": { "title": "Musée du Louvre", "price": 50 }
    },
    {
        "from": "PAR",
        "to": "NYC",
        "departDate": ISODate("2025-08-10T00:00:00Z"),
        "returnDate": ISODate("2025-08-20T00:00:00Z"),
        "provider": "SkyEurope",
        "price": 750,
        "currency": "EUR",
        "legs": [{ "flightNum": "SE300", "dep": "CDG", "arr": "JFK", "duration": 490 }],
        "hotel": { "name": "Empire Hotel", "nights": 6, "price": 500 },
        "activity": { "title": "Central Park Tour", "price": 60 }
    },
    {
        "from": "PAR",
        "to": "NYC",
        "departDate": ISODate("2025-08-15T00:00:00Z"),
        "returnDate": ISODate("2025-08-25T00:00:00Z"),
        "provider": "FlyAway",
        "price": 680,
        "currency": "EUR",
        "legs": [{ "flightNum": "FA202", "dep": "CDG", "arr": "EWR", "duration": 510 }],
        "hotel": { "name": "Liberty Suites", "nights": 5, "price": 430 },
        "activity": { "title": "Statue of Liberty Visit", "price": 85 }
    },
    {
        "from": "PAR",
        "to": "NYC",
        "departDate": ISODate("2025-09-01T00:00:00Z"),
        "returnDate": ISODate("2025-09-10T00:00:00Z"),
        "provider": "EuroJet",
        "price": 720,
        "currency": "EUR",
        "legs": [{ "flightNum": "EJ404", "dep": "ORY", "arr": "JFK", "duration": 500 }],
        "hotel": { "name": "Brooklyn Lodge", "nights": 5, "price": 410 },
        "activity": { "title": "Brooklyn Bridge Walk", "price": 55 }
    },
    {
        "from": "PAR",
        "to": "NYC",
        "departDate": ISODate("2025-09-10T00:00:00Z"),
        "returnDate": ISODate("2025-09-18T00:00:00Z"),
        "provider": "JetStream",
        "price": 690,
        "currency": "EUR",
        "legs": [{ "flightNum": "JS999", "dep": "CDG", "arr": "JFK", "duration": 485 }],
        "hotel": { "name": "SoHo Grand", "nights": 6, "price": 530 },
        "activity": { "title": "Broadway Night", "price": 95 }
    }
]);

// Index de tri pour les requêtes classiques
db.offers.createIndex({ from: 1, to: 1, price: 1 });

// Index texte combiné pour recherche avec ?q=
db.offers.createIndex({
    provider: "text",
    "hotel.name": "text",
    "activity.title": "text"
});

db.users.drop();
db.users.insertMany([
  { userId: 'u1',   name: 'Alice',   roles: ['user'] },
  { userId: 'u42',  name: 'Bob',     roles: ['user','admin'] },
  { userId: 'u123', name: 'Charlie', roles: ['user'] }
]);

console.log('✅ Initialisation de la base de données terminée.');
