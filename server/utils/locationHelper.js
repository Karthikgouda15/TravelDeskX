const locationAliases = {
  'bangalore': ['bangalore', 'bengaluru', 'blr', 'sbc', 'ksr bengaluru'],
  'mumbai': ['mumbai', 'bombay', 'bom', 'bct', 'mumbai central'],
  'delhi': ['delhi', 'new delhi', 'del', 'ndls'],
  'pune': ['pune', 'pnq', 'pune jn'],
  'dubai': ['dubai', 'dxb'],
  'london': ['london', 'lhr'],
  'singapore': ['singapore', 'sin'],
  'sydney': ['sydney', 'syd'],
  'new york': ['new york', 'nyc', 'jfk'],
  'los angeles': ['los angeles', 'lax']
};

exports.buildLocationRegex = (searchTerm) => {
  if (!searchTerm) return '';
  const term = searchTerm.toLowerCase().trim();
  
  for (const [key, aliases] of Object.entries(locationAliases)) {
    if (aliases.includes(term) || term.includes(key) || key.includes(term)) {
      return aliases.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    }
  }
  
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
