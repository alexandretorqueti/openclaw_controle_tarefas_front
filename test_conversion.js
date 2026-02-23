const { convertToSnakeCase } = require('./dist/types/index.js');

// Test data
const testData = {
  statusId: "92f96651-12ed-4eea-b9fa-b3add27cc26d",
  priorityId: "8ea78335-a697-466c-a268-ab70e2195106",
  title: "Test Task",
  description: "Test description"
};

console.log("Original (camelCase):", JSON.stringify(testData, null, 2));
console.log("Converted (snake_case):", JSON.stringify(convertToSnakeCase(testData), null, 2));
