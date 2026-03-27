#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const schemaPath = path.join(projectRoot, 'public/schema/design.v1.json');
const designsDir = path.join(projectRoot, 'public/designs');

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

const designFiles = fs.readdirSync(designsDir).filter(f => f.endsWith('.json'));

if (designFiles.length === 0) {
  console.log('No design files found in public/designs/');
  process.exit(0);
}

let hasErrors = false;

for (const file of designFiles) {
  const filePath = path.join(designsDir, file);
  const design = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const valid = validate(design);
  
  if (valid) {
    console.log(`✓ ${file} - valid`);
  } else {
    console.log(`✗ ${file} - invalid:`);
    console.log(JSON.stringify(validate.errors, null, 2));
    hasErrors = true;
  }
}

if (hasErrors) {
  console.log('\n✗ Validation failed - some designs are invalid');
  process.exit(1);
} else {
  console.log('\n✓ All designs are valid');
  process.exit(0);
}