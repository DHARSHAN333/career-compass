import { retrieveRelevantContext } from '../src/services/knowledgeBase.service.js';

async function run() {
  const query = 'Senior software engineer with Python and distributed systems experience';
  const context = await retrieveRelevantContext(query, 3);

  console.log('='.repeat(60));
  console.log('Knowledge base retrieval smoke test');
  console.log('='.repeat(60));
  console.log(`Query: ${query}`);
  console.log('');
  console.log(context || 'No documents retrieved.');
  console.log('');
  console.log('Done.');
}

run().catch((error) => {
  console.error('Failed to build/test knowledge base:', error.message);
  process.exit(1);
});