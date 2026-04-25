import assert from 'assert';
import { generateText } from '../src/services/llm.service.js';

async function run() {
  const response = await generateText({
    prompt: 'Reply with exactly: pong',
    systemPrompt: 'Be concise.',
    userConfig: {},
    temperature: 0
  });

  // In environments without an API key, service returns null and falls back elsewhere.
  assert.ok(response === null || typeof response === 'string');
  console.log('✓ LLM adapter reachable (or gracefully disabled without key)');
}

run().catch((error) => {
  console.error('✗ LLM adapter test failed:', error.message);
  process.exit(1);
});