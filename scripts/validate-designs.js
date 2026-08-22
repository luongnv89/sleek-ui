#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

function createValidator(schemaPath) {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  return ajv.compile(schema);
}

function listDesignFiles(designsDir) {
  try {
    return fs.readdirSync(designsDir).filter(f => f.endsWith('.json'));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function validateDesignFile(filePath, validate) {
  let design;
  try {
    design = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return { valid: false, errors: [{ message: `invalid JSON: ${err.message}` }] };
  }
  const valid = validate(design);
  const errors = valid ? [] : (validate.errors || [{ message: 'validation failed' }]);
  return { valid, errors: [...errors] };
}

function validateDesignsInDir(designsDir, validate, log = console.log) {
  const designFiles = listDesignFiles(designsDir);
  if (designFiles === null) {
    log(`Designs directory not found: ${designsDir}`);
    return { hasErrors: true, total: 0, invalid: 0 };
  }
  if (designFiles.length === 0) {
    log(`No design files found in ${designsDir}`);
    return { hasErrors: false, total: 0, invalid: 0 };
  }

  let hasErrors = false;
  let invalid = 0;

  for (const file of designFiles) {
    const filePath = path.join(designsDir, file);
    const result = validateDesignFile(filePath, validate);

    if (result.valid) {
      log(`✓ ${file} - valid`);
    } else {
      log(`✗ ${file} - invalid:`);
      log(JSON.stringify(result.errors, null, 2));
      hasErrors = true;
      invalid++;
    }
  }

  return { hasErrors, total: designFiles.length, invalid };
}

if (require.main === module) {
  const projectRoot = path.resolve(__dirname, '..');
  const schemaPath = path.join(projectRoot, 'public', 'schema', 'design.v1.json');
  const designsDir = path.join(projectRoot, 'public', 'designs');

  const validate = createValidator(schemaPath);
  const { hasErrors } = validateDesignsInDir(designsDir, validate);

  if (hasErrors) {
    console.log('\n✗ Validation failed - some designs are invalid');
    process.exit(1);
  } else {
    console.log('\n✓ All designs are valid');
    process.exit(0);
  }
}

module.exports = { createValidator, listDesignFiles, validateDesignFile, validateDesignsInDir };
