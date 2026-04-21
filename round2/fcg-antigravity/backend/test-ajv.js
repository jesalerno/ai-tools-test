import Ajv from 'ajv';
try {
  const ajv = new Ajv();
  const validate = ajv.compile({ type: 'object', properties: { method: { type: 'string', enum: ['A', 'B'] } } });
  validate({ method: 'C' });
  console.log(ajv.errorsText(validate.errors));
} catch(err) { console.log("ERROR:", err.message); }
