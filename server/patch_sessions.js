const fs = require('fs');
let code = fs.readFileSync('controllers/bookingController.js', 'utf8');

// Mock session
code = code.replace(/const session = await mongoose\.startSession\(\);/g, 
  "const session = { withTransaction: async (cb) => { await cb(); }, endSession: () => {} };\n  const sessionOpt = { session: null };");

// Replace { session } with sessionOpt
code = code.replace(/\{ session \}/g, "sessionOpt");

// Replace { new: true, session } with { new: true, ...sessionOpt }
code = code.replace(/\{ new: true, session \}/g, "{ new: true, ...sessionOpt }");

fs.writeFileSync('controllers/bookingController.js', code);
console.log('Patched');
