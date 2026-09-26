const { ROOT, cssName, scope, validateSources, readSources } = require('./scripts/lib/tokens.cjs');
const { readRecipes, buildDeclarations } = require('./scripts/lib/css-recipes.cjs');

module.exports = {
  usesDtcg: true,
  source: ['primitives', 'responsive', 'component', 'semantic'].map(tier => `${ROOT}/${tier}/**/*.json`),
  preprocessors: ['legacyhq/validate'],
  hooks: {
    preprocessors: {
      'legacyhq/validate': dictionary => {
        const { tokens, byId } = validateSources(readSources());
        buildDeclarations(tokens, byId, readRecipes());
        return dictionary;
      }
    },
    transforms: {
      'figma/name': { type: 'name', transform: token => cssName(token.path) }
    },
    formats: {
      'legacyhq/css': ({ dictionary, options }) => {
        const entry = token => ({ node: token.original, id: token.path.join('.'), name: token.name, path: token.path });
        // Include targets from other CSS files so aliases remain live at runtime.
        const entries = dictionary.unfilteredAllTokens.map(entry);
        const byId = new Map(entries.map(token => [token.id, token]));
        const declarations = buildDeclarations(entries, byId, readRecipes())[options.mode];
        return '/**\n * Do not edit directly, this file was auto-generated.\n */\n\n'
          + `${options.selector} {\n`
          + declarations.map(token => `  --${token.name}: ${token.value};`).join('\n')
          + '\n}\n';
      }
    }
  },
  platforms: Object.fromEntries(['tokens', 'light', 'dark'].map(mode => [mode, {
    transforms: ['figma/name'],
    buildPath: 'packages/ui/src/tokens/generated/',
    files: [{
      destination: `${mode}.css`, format: 'legacyhq/css',
      filter: token => scope(token) === mode,
      options: { mode, selector: mode === 'dark' ? '[data-theme="dark"]' : ':root' }
    }]
  }]))
};
