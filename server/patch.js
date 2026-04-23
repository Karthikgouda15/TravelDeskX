const fs = require('fs');
const filepath = 'controllers/bookingController.js';
let code = fs.readFileSync(filepath, 'utf8');

code = code.replace(/const session = await mongoose\.startSession\(\);/g, 
  "const session = { withTransaction: async (cb) => { await cb(); }, endSession: () => {} };\\n  const mockSession = undefined;");

code = code.replace(/\{ session \}/g, "{ session: mockSession }");
code = code.replace(/\{ new: true, session \}/g, "{ new: true, session: mockSession }");

fs.writeFileSync(filepath, code);
console.log('Done!');
