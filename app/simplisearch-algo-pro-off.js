const synonyms = [
  ["happy", "joyful", "content", "cheerful", "elated", "glad", "delighted", "jovial"],
  ["sad", "unhappy", "sorrowful", "downcast", "mournful", "dejected", "disheartened", "gloomy"],
  ["fast", "quick", "rapid", "swift", "speedy", "hasty", "brisk", "nimble"],
  ["slow", "lethargic", "sluggish", "gradual", "delayed", "unhurried", "lazy", "leisurely"],
  ["smart", "intelligent", "clever", "bright", "brainy", "sharp", "wise", "astute"],
  ["strong", "powerful", "sturdy", "robust", "tough", "resilient", "muscular", "vigorous"],
  ["beautiful", "pretty", "lovely", "gorgeous", "attractive", "charming", "stunning", "elegant"],
  ["big", "large", "huge", "massive", "enormous", "gigantic", "colossal", "immense"],
  ["small", "tiny", "petite", "minute", "miniature", "compact", "minuscule", "slight"],
  ["angry", "mad", "furious", "irate", "enraged", "irritated", "livid", "wrathful"],
  ["bright", "radiant", "luminous", "vivid", "brilliant", "shiny", "dazzling", "gleaming"],
  ["cold", "chilly", "frigid", "icy", "cool", "freezing", "nippy", "glacial"],
  ["hot", "warm", "scorching", "boiling", "sweltering", "sizzling", "burning", "toasty"],
  ["strong", "mighty", "tough", "stout", "potent", "sturdy", "firm", "solid"],
  ["weak", "frail", "fragile", "delicate", "feeble", "vulnerable", "thin", "brittle"],
  ["rich", "wealthy", "affluent", "prosperous", "opulent", "loaded", "well-off", "well-to-do"],
  ["poor", "needy", "impoverished", "destitute", "broke", "penniless", "down-and-out", "underprivileged"],
  ["fast", "hasty", "expeditious", "fleet", "accelerated", "instant", "prompt", "urgent"],
  ["slow", "unhurried", "deliberate", "lagging", "tardy", "inactive", "gradual", "languid"],
  ['one', '1', 'uno', 'un', 'une', 'unique', 'first'],
  ['two', '2', 'dos', 'double', 'second'],
];

function ngrams(str, size = 2) {
  str = str.toLowerCase();
  const grams = [];
  for (let i = 0; i < str.length - size + 1; i++) {
    grams.push(str.slice(i, i + size));
  }
  return grams;
}

function ngramSimilarity(a, b, size = 2) {
  const aGrams = ngrams(a, size);
  const bGrams = ngrams(b, size);
  const matches = aGrams.filter(g => bGrams.includes(g)).length;
  return matches / Math.max(aGrams.length, bGrams.length);
}

// Calcule un score de similarité entre un tableau de mots et une chaîne
function findSimilarity(qWords, item) {
  let score = 0;
  const query = qWords.join('');

  for (const w of qWords) {
    if (item.includes(w)) {
      score++;
      if (item.includes(`${w} `)) score++;
      const indexDiff = query.indexOf(w) - item.indexOf(w);
      if ([0, 1, 2, 3, -1, -2, -3].includes(indexDiff)) score += 0.5;
    } else {
      const group = synonyms.find(s => s.includes(w));
      if (group && group.some(s => item.includes(s))) {
        score += 0.5;
      } else {
        // N-gram matching si aucun match direct ou synonyme
        const wordsInItem = item.toLowerCase().split(/\W+/);
        for (const word of wordsInItem) {
          const sim = ngramSimilarity(w, word);
          if (sim > 0.5) {
            score += sim; // Ajoute un score relatif (par exemple 0.6)
            break;
          }
        }
      }
    }
  }
  return score;
}

// Applique un format à la requête
function useFormats(query, options) {
  const formatTo = options.formatTo?.trim().toLowerCase();
  query = query.replace(/\s+/g, ' ').toLowerCase();

  const buildCamelParts = () => ({
    query: query.split(' ')
      .map((w, i) => i === 0 ? w : w[0].toUpperCase() + w.slice(1))
      .join(''),
    separator: /[a-z]+|[A-Z][a-z]*/g,
    type: 'camel'
  });

  switch (formatTo) {
    case 'camelcase': return buildCamelParts();
    case 'pascalcase':
      return {
        query: query.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(''),
        separator: /[a-z]+|[A-Z][a-z]*/g,
        type: 'camel'
      };
    case 'kebabcase':
      return { query: query.replace(/ /g, '-'), separator: '-', type: 'phys' };
    case 'snakecase':
      return { query: query.replace(/ /g, '_'), separator: '_', type: 'phys' };
    case 'screamingsnakecase':
      return { query: query.toUpperCase().replace(/ /g, '_'), separator: '_', type: 'phys' };
    default:
      return { query, separator: ' ', type: 'phys' };
  }
}

// Fonction de recherche principale
function search(options) {
  const {
    query: rawQuery = '',
    list = [],
    concat,
    fallback = [],
    onFinish,
    strict = false,
    targets = ['str'],
    maxScore = 0.5,
    maxResults = list.length,
    addScore = false,
    minLength = 0,
    when,
    addedSynonims = []
  } = options;
  
  if (!Array.isArray(list) || list.length === 0) return fallback;
  if (rawQuery.trim() === '' || rawQuery.length < minLength) {
    const concated = concat ? list.map(concat).join('') : null;
    onFinish?.({ formatted: rawQuery, concated, list });
    return list;
  }
  synonyms.push(...addedSynonims)

  const { query, separator, type } = useFormats(rawQuery, options);
  const queryWords = type === 'camel' ? query.match(separator) : query.split(separator);

  const scored = list.map(item => {
    const totalScore = targets.map(t => {
      const key = typeof t === 'string' ? t : t.key;
      const weight = typeof t === 'string' ? 1 : t.weight || 1;
      const targetValue = key === 'str' ? item : item?.[key];

      if (typeof targetValue !== 'string') return 0;
      const value = ['-', ' '].includes(separator) ? targetValue.toLowerCase().trim() : targetValue;

      if (strict) return value === query ? weight : 0;

      const similarity = (findSimilarity(queryWords, value) + 1) / weight;
      return queryWords.length / similarity;
    }).reduce((a, b) => (a + b) / targets.length, 0);

    return { item, score: totalScore };
  });

  let results = scored
    .filter(r => r.score <= maxScore && r.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, maxResults )
    .map(r => addScore ? r : r.item);

  if (when) results = results.filter(when);
  const concated = concat ? results.map(concat).join('') : null;
  onFinish?.({ formatted: query, concated, results, fallback });

  return results.length ? results : fallback;
}

export default search;