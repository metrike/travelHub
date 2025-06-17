import neo4j from 'neo4j-driver';

const NEO4J_URI = 'bolt://neo4j:7687';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = 'supersecure123';

let driver;

try {
    driver = neo4j.driver(
        NEO4J_URI,
        neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
        {
            encrypted: 'ENCRYPTION_OFF'
        }
    );

    await driver.getServerInfo();
    console.log('✅ Connected to Neo4j');
} catch (err) {
    console.error('❌ Failed to connect to Neo4j:', err);
    process.exit(1);
}

export default driver;
