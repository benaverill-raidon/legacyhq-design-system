const { fileHeader } = require("style-dictionary/utils");

const VAR_REF_PATTERN = /^var\(--([a-z0-9-]+)\)$/i;

function isSemanticToken(token) {
  return String(token.name || "").startsWith("semantic-");
}

function isLightSemanticToken(token) {
  const name = String(token.name || "");
  return isSemanticToken(token) && !name.startsWith("semantic-dark-");
}

function isDarkSemanticToken(token) {
  const name = String(token.name || "");
  return isSemanticToken(token) && !name.startsWith("semantic-light-");
}

function shouldEmitPx(tokenName) {
  if (tokenName.startsWith("semantic-spacing-")) return true;
  if (tokenName.startsWith("semantic-border-radius-")) return true;
  if (tokenName.startsWith("semantic-border-width-")) return true;

  return (
    tokenName.startsWith("semantic-typography-") &&
    (
      tokenName.endsWith("-font-size") ||
      tokenName.endsWith("-line-height") ||
      tokenName.endsWith("-letter-spacing") ||
      tokenName.endsWith("-paragraph-spacing")
    )
  );
}

function asCssLiteral(resolvedValue, tokenName) {
  if (typeof resolvedValue === "number") {
    return shouldEmitPx(tokenName) ? `${resolvedValue}px` : `${resolvedValue}`;
  }

  if (typeof resolvedValue === "string" && /^-?\d+(\.\d+)?$/.test(resolvedValue)) {
    return shouldEmitPx(tokenName) ? `${resolvedValue}px` : resolvedValue;
  }

  return `${resolvedValue}`;
}

function resolveReferenceName(referenceName, tokenByName) {
  return tokenByName.has(referenceName) ? referenceName : null;
}

function collectTokensFromObject(node, acc = []) {
  if (!node || typeof node !== "object") return acc;

  if (
    Object.prototype.hasOwnProperty.call(node, "name") &&
    Object.prototype.hasOwnProperty.call(node, "value")
  ) {
    acc.push(node);
    return acc;
  }

  for (const value of Object.values(node)) {
    collectTokensFromObject(value, acc);
  }

  return acc;
}

function resolveSemanticValue(token, tokenByName, cache, stack = new Set()) {
  const cacheKey = String(token.name || "");
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const rawValue = token.value;

  if (typeof rawValue !== "string") {
    cache.set(cacheKey, rawValue);
    return rawValue;
  }

  const match = rawValue.match(VAR_REF_PATTERN);
  if (!match) {
    cache.set(cacheKey, rawValue);
    return rawValue;
  }

  const requestedRef = match[1];
  const resolvedRef = resolveReferenceName(requestedRef, tokenByName);

  if (!resolvedRef) {
    throw new Error(`Unresolved reference "${requestedRef}" from token "${cacheKey}".`);
  }

  if (stack.has(resolvedRef)) {
    throw new Error(`Circular token reference detected for "${resolvedRef}".`);
  }

  const referencedToken = tokenByName.get(resolvedRef);
  stack.add(resolvedRef);
  const referencedValue = resolveSemanticValue(referencedToken, tokenByName, cache, stack);
  stack.delete(resolvedRef);

  cache.set(cacheKey, referencedValue);
  return referencedValue;
}

module.exports = {
  source: [
    "tokens/input/primitives/**/*.json",
    "tokens/input/semantics/**/*.json"
  ],
  hooks: {
    filters: {
      "semantic/light": isLightSemanticToken,
      "semantic/dark": isDarkSemanticToken
    },
    formats: {
      "css/semantic-literals": async ({ dictionary, file }) => {
        const unfilteredTokens = collectTokensFromObject(dictionary.unfilteredTokens);
        const tokenByName = new Map(unfilteredTokens.map((token) => [token.name, token]));
        const resolvedCache = new Map();
        const lines = [];

        for (const token of dictionary.allTokens) {
          const tokenName = String(token.name || "");
          const rawResolvedValue = resolveSemanticValue(token, tokenByName, resolvedCache);
          const value = asCssLiteral(rawResolvedValue, tokenName);
          lines.push(`  --${tokenName}: ${value};`);
        }

        return `${await fileHeader({ file })}:root {\n${lines.join("\n")}\n}\n`;
      }
    }
  },
  platforms: {
    light: {
      transformGroup: "css",
      buildPath: "dist/tokens/",
      files: [
        {
          destination: "theme.light.css",
          format: "css/semantic-literals",
          filter: "semantic/light",
          options: {
            outputReferences: false
          }
        }
      ]
    },
    dark: {
      transformGroup: "css",
      buildPath: "dist/tokens/",
      files: [
        {
          destination: "theme.dark.css",
          format: "css/semantic-literals",
          filter: "semantic/dark",
          options: {
            outputReferences: false
          }
        }
      ]
    }
  }
};
