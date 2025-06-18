import neo4j from 'neo4j-driver';

const uri = 'bolt://neo4j:7687';
const user = 'neo4j';
const password = 'supersecure123';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

const runInit = async () => {
    try {
        console.log('🚀 Inserting cities and NEAR relations in Neo4j...');

        await session.writeTransaction(tx =>
            tx.run(`
        MERGE (par:City {code: 'PAR'})
        MERGE (tyo:City {code: 'TYO'})
        MERGE (nyc:City {code: 'NYC'})
        MERGE (rom:City {code: 'ROM'})

        MERGE (par)-[:NEAR {weight: 0.9}]->(tyo)
        MERGE (par)-[:NEAR {weight: 0.8}]->(nyc)
        MERGE (par)-[:NEAR {weight: 0.7}]->(rom)
      `)
        );

        console.log('✅ Neo4j init done.');
    } catch (err) {
        console.error('❌ Neo4j init error:', err);
    } finally {
        await session.close();
        await driver.close();
    }
};

runInit();
