import { convertOpenAISchemaToGemini } from '../lib/helper.js';
import { jsonNavigatorOutputSchema } from '../lib/json_schema.js';

// Convert the schema
console.log('Converting jsonNavigatorOutputSchema to Gemini format...');
const geminiSchema = convertOpenAISchemaToGemini(jsonNavigatorOutputSchema);

// pretty print the schema
console.log(JSON.stringify(geminiSchema, null, 2));
