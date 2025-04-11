/**
 * Type definition for a JSON Schema object
 */
export interface JsonSchemaObject {
  $ref?: string;
  $defs?: Record<string, JsonSchemaObject>;
  type?: string;
  properties?: Record<string, JsonSchemaObject>;
  items?: JsonSchemaObject;
  anyOf?: JsonSchemaObject[];
  title?: string;
  description?: string;
  required?: string[];
  default?: unknown;
  additionalProperties?: boolean;
  [key: string]: unknown;
}

/**
 * Dereferences all $ref fields in a JSON schema by replacing them with the actual referenced schema
 *
 * @param schema The JSON schema to dereference
 * @returns A new JSON schema with all references resolved
 */
export function dereferenceJsonSchema(schema: JsonSchemaObject): JsonSchemaObject {
  // Create a deep copy of the schema to avoid modifying the original
  const clonedSchema = JSON.parse(JSON.stringify(schema));

  // Extract definitions to use for resolving references
  const definitions = clonedSchema.$defs || {};

  // Process the schema
  const result = processSchemaNode(clonedSchema, definitions);

  // Create a new object without $defs
  const resultWithoutDefs: JsonSchemaObject = {};

  // Copy all properties except $defs
  for (const [key, value] of Object.entries(result)) {
    if (key !== '$defs') {
      resultWithoutDefs[key] = value;
    }
  }

  return resultWithoutDefs;
}

/**
 * Process a schema node, resolving all references
 */
function processSchemaNode(node: JsonSchemaObject, definitions: Record<string, JsonSchemaObject>): JsonSchemaObject {
  // If it's not an object or is null, return as is
  if (typeof node !== 'object' || node === null) {
    return node;
  }

  // If it's a reference, resolve it
  if (node.$ref) {
    const refPath = node.$ref.replace('#/$defs/', '');
    const definition = definitions[refPath];
    if (definition) {
      // Process the definition to resolve any nested references
      return processSchemaNode(definition, definitions);
    }
  }

  // Handle anyOf for references
  if (node.anyOf) {
    // Process each item in anyOf
    const processedAnyOf = node.anyOf.map(item => processSchemaNode(item, definitions));

    // If anyOf contains a reference and a null type, merge them
    const nonNullTypes = processedAnyOf.filter(item => item.type !== 'null');
    const hasNullType = processedAnyOf.some(item => item.type === 'null');

    if (nonNullTypes.length === 1 && hasNullType) {
      const result = { ...nonNullTypes[0] };
      result.nullable = true;
      return result;
    }

    // Otherwise, keep the anyOf structure but with processed items
    return {
      ...node,
      anyOf: processedAnyOf,
    };
  }

  // Create a new node with processed properties
  const result: JsonSchemaObject = {};

  // Copy all properties except $ref
  for (const [key, value] of Object.entries(node)) {
    if (key !== '$ref') {
      if (key === 'properties' && typeof value === 'object' && value !== null) {
        // Process properties
        result.properties = {};
        for (const [propKey, propValue] of Object.entries(value)) {
          result.properties[propKey] = processSchemaNode(propValue as JsonSchemaObject, definitions);
        }
      } else if (key === 'items' && typeof value === 'object' && value !== null) {
        // Process items for arrays
        result.items = processSchemaNode(value as JsonSchemaObject, definitions);
      } else {
        // Copy other properties as is
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Converts an OpenAI format JSON schema to a Google Gemini compatible schema
 *
 * Key differences handled:
 * 1. OpenAI uses $defs and $ref for references, Gemini uses inline definitions
 * 2. Different structure for nullable properties
 * 3. Gemini has a flatter structure for defining properties
 *
 * @param openaiSchema The OpenAI format JSON schema to convert
 * @returns A Google Gemini compatible JSON schema
 */
export function convertOpenAISchemaToGemini(openaiSchema: JsonSchemaObject): JsonSchemaObject {
  // Create a new schema object
  const geminiSchema: JsonSchemaObject = {
    type: openaiSchema.type,
    properties: {},
    required: openaiSchema.required || [],
  };

  // Process definitions to use for resolving references
  const definitions = openaiSchema.$defs || {};

  // Process properties
  if (openaiSchema.properties) {
    geminiSchema.properties = processProperties(openaiSchema.properties, definitions);
  }

  return geminiSchema;
}

/**
 * Process properties recursively, resolving references and converting to Gemini format
 */
function processProperties(
  properties: Record<string, JsonSchemaObject>,
  definitions: Record<string, JsonSchemaObject>,
): Record<string, JsonSchemaObject> {
  const result: Record<string, JsonSchemaObject> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (typeof value !== 'object' || value === null) continue;

    result[key] = processProperty(value, definitions);
  }

  return result;
}

/**
 * Process a single property, resolving references and converting to Gemini format
 */
function processProperty(property: JsonSchemaObject, definitions: Record<string, JsonSchemaObject>): JsonSchemaObject {
  // If it's a reference, resolve it
  if (property.$ref) {
    const refPath = property.$ref.replace('#/$defs/', '');
    const definition = definitions[refPath];
    if (definition) {
      return processProperty(definition, definitions);
    }
  }

  // Handle anyOf for nullable properties
  if (property.anyOf) {
    const nonNullType = property.anyOf.find(item => item.type !== 'null' && !item.$ref);

    const refType = property.anyOf.find(item => item.$ref);

    const isNullable = property.anyOf.some(item => item.type === 'null');

    if (refType?.$ref) {
      const refPath = refType.$ref.replace('#/$defs/', '');
      const definition = definitions[refPath];

      if (definition) {
        const processed = processProperty(definition, definitions);
        if (isNullable) {
          processed.nullable = true;
        }
        return processed;
      }
    }

    if (nonNullType) {
      const processed = processProperty(nonNullType, definitions);
      if (isNullable) {
        processed.nullable = true;
      }
      return processed;
    }
  }

  // Create a new property object
  const result: JsonSchemaObject = {
    type: property.type,
  };

  // Copy description if it exists
  if (property.description) {
    result.description = property.description;
  }

  // Process nested properties
  if (property.properties) {
    result.properties = processProperties(property.properties, definitions);

    // Copy required fields
    if (property.required) {
      result.required = property.required;
    } else {
      result.required = [];
    }
  }

  // Handle arrays
  if (property.items) {
    result.items = processProperty(property.items, definitions);
  }

  // Handle special case for NoParamsAction which is an object in OpenAI but a string in Gemini
  if (property.additionalProperties === true && property.title === 'NoParamsAction' && property.description) {
    return {
      type: 'string',
      nullable: true,
      description: property.description,
    };
  }

  return result;
}
