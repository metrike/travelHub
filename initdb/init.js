// initdb/init.js
db = db.getSiblingDB('projet');

db.users.insertMany([
    {
        "userId": "u42",
        "name": "Alice Dupont",
        "email": "alice.dupont@example.com",
        "homeCity": "Paris",
        "preferredDestinations": ["Tokyo", "New York", "Rome"]
    },
    {
        "userId": "u17",
        "name": "Marc Tremblay",
        "email": "marc.tremblay@example.com",
        "homeCity": "Montreal",
        "preferredDestinations": ["Paris", "London"]
    },
    {
        "userId": "u99",
        "name": "Emma Rossi",
        "email": "emma.rossi@example.com",
        "homeCity": "Rome",
        "preferredDestinations": ["Tokyo", "New York", "London"]
    },
    {
        "userId": "u01",
        "name": "John Smith",
        "email": "john.smith@example.com",
        "homeCity": "New York",
        "preferredDestinations": ["Paris", "Rome", "Tokyo"]
    },
    {
        "userId": "u02",
        "name": "Sophie Müller",
        "email": "sophie.mueller@example.com",
        "homeCity": "Berlin",
        "preferredDestinations": ["Madrid", "Paris", "Rome"]
    },
    {
        "userId": "u03",
        "name": "Carlos Martinez",
        "email": "carlos.martinez@example.com",
        "homeCity": "Madrid",
        "preferredDestinations": ["Berlin", "London", "New York"]
    },
    {
        "userId": "u04",
        "name": "Yuki Tanaka",
        "email": "yuki.tanaka@example.com",
        "homeCity": "Tokyo",
        "preferredDestinations": ["Paris", "Rome", "New York"]
    },
    {
        "userId": "u05",
        "name": "Fatima Zahra",
        "email": "fatima.zahra@example.com",
        "homeCity": "Casablanca",
        "preferredDestinations": ["Madrid", "Paris", "Berlin"]
    }
]);


db.offer.insertMany([
    {
        "from": "PAR",
        "to": "TYO",
        "departDate": "2025-07-01T00:00:00Z",
        "returnDate": "2025-07-15T00:00:00Z",
        "provider": "AirZen",
        "price": 750.00,
        "currency": "EUR",
        "legs": [
            { "flightNum": "AZ123", "dep": "CDG", "arr": "NRT", "duration": 720 }
        ],
        "hotel": { "name": "Hotel Fuji", "nights": 5, "price": 500 },
        "activity": { "title": "Visite Mont Fuji", "price": 120 }
    },
    {
        "from": "NYC",
        "to": "PAR",
        "departDate": "2025-08-10T00:00:00Z",
        "returnDate": "2025-08-20T00:00:00Z",
        "provider": "FlyDirect",
        "price": 650,
        "currency": "EUR",
        "legs": [
            { "flightNum": "FD321", "dep": "JFK", "arr": "CDG", "duration": 480 }
        ],
        "hotel": { "name": "Hôtel Parisien", "nights": 4, "price": 400 },
        "activity": { "title": "Tour Eiffel + Croisière", "price": 75 }
    },
    {
        "from": "LON", "to": "ROM", "departDate": "2025-09-05T00:00:00Z", "returnDate": "2025-09-12T00:00:00Z",
        "provider": "EuroFly", "price": 300, "currency": "EUR",
        "legs": [{ "flightNum": "EF987", "dep": "LHR", "arr": "FCO", "duration": 150 }],
        "hotel": null, "activity": null
    },
    {
        "from": "BER", "to": "BCN", "departDate": "2025-06-01T00:00:00Z", "returnDate": "2025-06-07T00:00:00Z",
        "provider": "SunnyTrips", "price": 220, "currency": "EUR",
        "legs": [{ "flightNum": "ST124", "dep": "TXL", "arr": "BCN", "duration": 160 }],
        "hotel": { "name": "Barcelona Inn", "nights": 6, "price": 390 },
        "activity": { "title": "Sagrada Familia Tour", "price": 45 }
    },
    // ➕ tu peux continuer avec tous les autres documents identiques, **mais sans les crochets autour du tableau**
]);


db.offer.createIndex({ from: 1, to: 1, price: 1 });
db.offer.createIndex({ provider: "text" });