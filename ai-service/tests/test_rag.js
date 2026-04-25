import assert from 'assert';
import { retrieveRelevantContext } from '../src/services/knowledgeBase.service.js';

async function testRagRetrieval() {
  const result = await retrieveRelevantContext('React Node.js fullstack resume', 2);
  assert.equal(typeof result, 'string');
  console.log('✓ RAG retrieval returns a string payload');
}

testRagRetrieval().catch((err) => {
  console.error('✗ RAG test failed:', err.message);
  process.exit(1);
});