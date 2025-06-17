import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
    'bolt://neo4j:7687', // ✔️ le nom du service docker-compose
    neo4j.auth.basic('neo4j', 'supersecure123') // ou ton mot de passe défini dans docker-compose
);

export default driver;
