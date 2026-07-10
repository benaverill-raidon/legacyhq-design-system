import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const iconsDir = path.join(rootDir, 'packages/ui/src/assets/icons');
const sourceDir = path.join(iconsDir, 'source');
const generatedDir = path.join(iconsDir, 'generated');
const metadataDir = path.join(iconsDir, 'metadata');

const singlePurposeNames = new Set([
  'administrative-account',
  'alive-and-well',
  'assets',
  'auto-edit',
  'bank-account',
  'closely-held-business',
  'contact-support',
  'counselpro-logo',
  'data-error',
  'deceased',
  'disinherited',
  'document-add',
  'document-generation',
  'document-templates',
  'family-tree',
  'event-templates',
  'events',
  'firms-all',
  'integrity-management',
  'investment-account',
  'life-insurance-policy',
  'non-qualified-annuity',
  'people-all',
  'person-account',
  'person-account-management',
  'qualified-plan',
  'real-estate',
  'referral',
  'referral-direct-mail',
  'referral-existing-client',
  'referral-internet',
  'referral-newspaper',
  'savings-bond',
  'schedule-meeting',
  'services-legal',
  'team-and-partners',
  'treasury-direct',
  'wealth-management',
]);

const keywordAliases = {
  add: ['create', 'plus', 'new'],
  archive: ['box', 'store'],
  'archive-remove': ['unarchive', 'restore'],
  search: ['find', 'lookup'],
  close: ['dismiss', 'remove', 'x'],
  check: ['done', 'confirm', 'success'],
  delete: ['trash', 'remove'],
  edit: ['pencil', 'modify'],
  'link-external': ['external', 'open'],
  'log-in': ['login', 'sign in'],
  'log-out': ['logout', 'sign out'],
  notification: ['bell', 'alert'],
  'visibility-show': ['show', 'eye'],
  'visibility-hide': ['hide', 'eye'],
};

function toPascalCase(name) {
  return name
    .replace(/[_\s]+/g, '-')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toKebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function toDisplayName(name) {
  return name
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getKeywords(name) {
  const base = name
    .replace(/_/g, '-')
    .split(/[-\s]+/)
    .filter(Boolean);

  return Array.from(new Set([name, ...base, ...(keywordAliases[name] ?? [])]));
}

function cleanSvg(svg) {
  return svg
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<title[\s\S]*?<\/title>/gi, '')
    .replace(/<desc[\s\S]*?<\/desc>/gi, '')
    .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
    .replace(/<defs[\s\S]*?<\/defs>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\s+xmlns(:\w+)?="[^"]*"/g, '')
    .replace(/\s+data-[\w-]+="[^"]*"/g, '')
    .replace(/\s+width="[^"]*"/i, '')
    .replace(/\s+height="[^"]*"/i, '')
    .replace(/\s+clipPath="url\([^)]+\)"/g, '')
    .replace(/\s+fill-rule=/g, ' fillRule=')
    .replace(/\s+clip-rule=/g, ' clipRule=')
    .replace(/\s+stroke-linecap=/g, ' strokeLinecap=')
    .replace(/\s+stroke-linejoin=/g, ' strokeLinejoin=')
    .replace(/\s+stroke-width=/g, ' strokeWidth=')
    .replace(/\s+stroke-miterlimit=/g, ' strokeMiterlimit=')
    .replace(/\s+clip-path=/g, ' clipPath=')
    .replace(/\s+class=/g, ' className=')
    .replace(/\s+style="[^"]*"/g, '')
    .replace(/\s+id="[^"]*"/g, '')
    .trim();
}

function normalizePaint(svg) {
  return svg
    .replace(/\sfill="(?!none\b|currentColor\b|url\()[^"]*"/gi, ' fill="currentColor"')
    .replace(/\sstroke="(?!none\b|currentColor\b|url\()[^"]*"/gi, ' stroke="currentColor"')
    .replace(/<svg([^>]*)>/i, (_match, attrs) => {
      const withoutPaint = attrs.replace(/\sfill="[^"]*"/i, '').replace(/\sstroke="[^"]*"/i, '');
      return `<svg${withoutPaint} fill="currentColor">`;
    });
}

function extractSvg(svg, fileName) {
  const match = svg.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i);

  if (!match) {
    throw new Error(`Missing <svg> element in ${fileName}`);
  }

  const attrs = match[1];
  const content = match[2].trim();
  const viewBox = attrs.match(/\sviewBox="([^"]+)"/i)?.[1] ?? '0 0 24 24';

  return { viewBox, content };
}

function buildComponent({ component, displayName, viewBox, content }) {
  return `import * as React from 'react';
import { IconBase } from '../../../components/primitives/icon';
import type { IconProps } from '../../../components/primitives/icon';

export const ${component} = React.memo(function ${component}(props: IconProps) {
  return (
    <IconBase {...props} viewBox="${viewBox}">
      ${content}
    </IconBase>
  );
});

${component}.displayName = '${displayName}';
`;
}

async function main() {
  await mkdir(generatedDir, { recursive: true });
  await mkdir(metadataDir, { recursive: true });
  await rm(generatedDir, { recursive: true, force: true });
  await mkdir(generatedDir, { recursive: true });

  const files = (await readdir(sourceDir))
    .filter((file) => file.toLowerCase().endsWith('.svg'))
    .sort((a, b) => a.localeCompare(b));

  const metadata = [];
  const hardcodedPaint = [];
  const exports = [];

  for (const file of files) {
    const name = toKebabCase(path.basename(file, '.svg'));
    const component = `${toPascalCase(name)}Icon`;
    const displayName = component;
    const generatedFileName = `${name}-icon`;
    const sourcePath = path.join(sourceDir, file);
    const rawSvg = await readFile(sourcePath, 'utf8');
    const normalizedSvg = normalizePaint(cleanSvg(rawSvg));
    const { viewBox, content } = extractSvg(normalizedSvg, file);
    const remainingPaint = [...content.matchAll(/\s(?:fill|stroke)="(?!none\b|currentColor\b|url\()[^"]+"/gi)];

    if (remainingPaint.length > 0) {
      hardcodedPaint.push(file);
    }

    await writeFile(
      path.join(generatedDir, `${generatedFileName}.tsx`),
      buildComponent({ component, displayName, viewBox, content }),
    );

    exports.push(`export { ${component} } from './${generatedFileName}';`);
    metadata.push({
      name,
      component,
      category: singlePurposeNames.has(name) ? 'single-purpose' : 'multi-purpose',
      keywords: getKeywords(name),
      label: toDisplayName(name),
    });
  }

  await writeFile(path.join(generatedDir, 'index.ts'), `${exports.join('\n')}\n`);
  await writeFile(path.join(iconsDir, 'index.ts'), "export * from './generated';\nexport { default as iconMetadata } from './metadata/icons.json';\n");
  await writeFile(path.join(metadataDir, 'icons.json'), `${JSON.stringify(metadata, null, 2)}\n`);

  if (hardcodedPaint.length > 0) {
    console.warn(`Icons with unresolved hardcoded paint: ${hardcodedPaint.join(', ')}`);
  }

  console.log(`Generated ${metadata.length} icons.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

