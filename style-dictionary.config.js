const fs = require("node:fs");

const TOKEN_ROOT = fs.existsSync("packages/ui/src/tokens/src/primitives/primitive.json")
  ? "packages/ui/src/tokens/src"
  : fs.existsSync("packages/ui/src/tokens/primitives/primitive.json") ||
      fs.existsSync("packages/ui/src/tokens/primitive.json")
    ? "packages/ui/src/tokens"
    : "packages/ui/tokens";

const GENERATED_PATH = "packages/ui/src/tokens/generated/";
const MODE_WRAPPERS = new Set(["Value", "Light", "Dark", "Mode 1"]);
const THEME_MODE_WRAPPERS = new Set(["Light", "Dark", "Mode 1"]);

function normalizeNameSegment(segment) {
  return String(segment)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function tokenName(token) {
  return token.path.filter((part) => !MODE_WRAPPERS.has(part)).map(normalizeNameSegment).join("-");
}

function collectPrimitiveValues(node, pathParts = [], acc = new Map()) {
  if (!node || typeof node !== "object") return acc;

  if (Object.prototype.hasOwnProperty.call(node, "value")) {
    const name = pathParts.filter((part) => !MODE_WRAPPERS.has(part)).map(normalizeNameSegment).join("-");
    acc.set(name, node.value);
    return acc;
  }

  for (const [key, value] of Object.entries(node)) {
    collectPrimitiveValues(value, [...pathParts, key], acc);
  }

  return acc;
}

function normalizedFilePath(token) {
  return String(token.filePath || "").replace(/\\/g, "/");
}

function isPrimitive(token) {
  return normalizedFilePath(token).includes("/primitives/") && token.path[0] === "Value";
}

function isResponsive(token) {
  return normalizedFilePath(token).includes("/responsive/");
}

function isComponent(token) {
  return normalizedFilePath(token).includes("/component/");
}

function isThemeWrappedToken(token) {
  return THEME_MODE_WRAPPERS.has(token.path[0]);
}

function isComponentModeToken(token) {
  return isComponent(token) && isThemeWrappedToken(token);
}

function isBaseToken(token) {
  return isPrimitive(token) || isResponsive(token) || (isComponent(token) && !isThemeWrappedToken(token));
}

function isLightSemantic(token) {
  return (
    (normalizedFilePath(token).includes("/semantic/") &&
      (token.path[0] === "Light" || token.path[0] === "Mode 1")) ||
    isComponentModeToken(token) && (token.path[0] === "Light" || token.path[0] === "Mode 1")
  );
}

function isDarkSemantic(token) {
  return (
    (normalizedFilePath(token).includes("/semantic/") &&
      (token.path[0] === "Dark" || token.path[0] === "Mode 1")) ||
    isComponentModeToken(token) && (token.path[0] === "Dark" || token.path[0] === "Mode 1")
  );
}

function isFontWeight(token) {
  const name = tokenName(token);
  return name.startsWith("typography-font-weight-") || name.endsWith("-font-weight");
}

function isTextTransform(token) {
  return tokenName(token).startsWith("typography-text-transform-");
}

function isSelfReference(token) {
  const match = typeof token.value === "string" && token.value.match(/^var\(--([^)]+)\)$/);
  return Boolean(match && match[1] === tokenName(token));
}

function stripPxUnit(value) {
  return typeof value === "string" ? value.replace(/^(-?\d+(?:\.\d+)?)px$/, "$1") : value;
}

function stripOuterQuotes(value) {
  return typeof value === "string" ? value.replace(/^"([^"]+)"$/, "$1") : value;
}

const primitiveFile = `${TOKEN_ROOT}/primitives/primitive.json`;
const primitiveValuesByName = fs.existsSync(primitiveFile)
  ? collectPrimitiveValues(JSON.parse(fs.readFileSync(primitiveFile, "utf8")))
  : new Map();

module.exports = {
  source: [
    `${TOKEN_ROOT}/primitives/**/*.json`,
    `${TOKEN_ROOT}/responsive/**/*.json`,
    `${TOKEN_ROOT}/component/**/*.json`,
    `${TOKEN_ROOT}/semantic/**/*.json`
  ],
  hooks: {
    filters: {
      base: isBaseToken,
      "semantic/light": isLightSemantic,
      "semantic/dark": isDarkSemantic
    },
    transforms: {
      "figma/name": {
        type: "name",
        transform: tokenName
      },
      "figma/font-weight": {
        type: "value",
        transitive: true,
        filter: isFontWeight,
        transform: (token) => stripPxUnit(token.value)
      },
      "figma/self-reference": {
        type: "value",
        transitive: true,
        filter: isSelfReference,
        transform: (token) => primitiveValuesByName.get(tokenName(token)) || token.value
      },
      "figma/text-transform": {
        type: "value",
        transitive: true,
        filter: isTextTransform,
        transform: (token) => stripOuterQuotes(token.value)
      }
    },
    transformGroups: {
      "figma/css": [
        "attribute/cti",
        "figma/name",
        "figma/self-reference",
        "figma/font-weight",
        "figma/text-transform",
        "color/css"
      ]
    }
  },
  platforms: {
    tokens: {
      transformGroup: "figma/css",
      buildPath: GENERATED_PATH,
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          filter: "base",
          options: {
            selector: ":root",
            outputReferences: true
          }
        }
      ]
    },
    light: {
      transformGroup: "figma/css",
      buildPath: GENERATED_PATH,
      files: [
        {
          destination: "light.css",
          format: "css/variables",
          filter: "semantic/light",
          options: {
            selector: ":root",
            outputReferences: true
          }
        }
      ]
    },
    dark: {
      transformGroup: "figma/css",
      buildPath: GENERATED_PATH,
      files: [
        {
          destination: "dark.css",
          format: "css/variables",
          filter: "semantic/dark",
          options: {
            selector: '[data-theme="dark"]',
            outputReferences: true
          }
        }
      ]
    }
  }
};
