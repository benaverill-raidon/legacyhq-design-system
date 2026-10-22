import * as React from 'react';
import { Code, DocFooter, DocHeader, DocPage, DocSection, breakable, doc } from '../../blocks/doc-page';
import { DocLink } from '../../blocks/doc-link';
import { titleCase } from '../../blocks/doc-helpers';
import { roles } from '../foundations/typography-data';
import { Switch } from '../../../components/atoms/switch';
import { catalogue, categoriesFor, cssByMode, families, referencesOf, resolvedValue, sourceTokens, tokensFor } from './token-data';
import type { Category, Mode, Tier, Token } from './token-data';
import styles from './token-reference.module.css';

const tierNames: Record<Tier, string> = { primitives: 'Tier 1: Primitives', semantic: 'Tier 2: Semantic', component: 'Tier 3: Component' };

/** The reference theme changes the whole documentation surface, values, and previews. */
export function TokenTheme({ children, showSwitch = false }: { children: React.ReactNode | ((mode: Mode) => React.ReactNode); showSwitch?: boolean }) {
  const [selectedMode, setMode] = React.useState<Mode>('Light');
  const mode = showSwitch ? selectedMode : 'Light';
  const surface = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    // Include Storybook's surrounding Docs gutters, restoring its theme on navigation away.
    const canvas = surface.current?.closest('.sbdocs-wrapper');
    if (!canvas) return;
    const previous = canvas.getAttribute('data-theme');
    canvas.setAttribute('data-theme', mode.toLowerCase());
    return () => {
      if (previous === null) canvas.removeAttribute('data-theme');
      else canvas.setAttribute('data-theme', previous);
    };
  }, [mode]);
  return <div ref={surface} className={styles.surface} data-theme={mode.toLowerCase()}>
    {showSwitch && <div className={styles.themeControl}>
      <Switch size="sm" label="Dark reference theme" showIcons={false} checked={mode === 'Dark'} onCheckedChange={checked => setMode(checked ? 'Dark' : 'Light')} />
    </div>}
    {typeof children === 'function' ? children(mode) : children}
  </div>;
}

function TokenPreview({ token, mode }: { token: Token; mode: Mode }) {
  const value = resolvedValue(token, mode);
  const live = token.emitted ? `var(--${token.name})` : value;
  const shape = token.name.includes('radius');
  const border = token.name.includes('border-width');
  if (token.type === 'color' || token.category === 'Color') return <div className={styles.checker} aria-hidden="true"><div className={styles.swatch} style={{ background: live }} /></div>;
  if (token.type === 'shadow') return <div className={styles.shadowWell} aria-hidden="true"><div className={styles.shape} style={{ boxShadow: live }} /></div>;
  if (shape) return <div className={styles.shape} style={{ borderRadius: live }} aria-hidden="true" />;
  if (border) return <div className={styles.stroke} style={{ borderTopWidth: live }} aria-hidden="true" />;
  if (token.type === 'fontFamily' || token.type === 'fontWeight' || /typography-(font-size|line-height|letter-spacing)/.test(token.name) || /typography-.*-(font-size|line-height|letter-spacing)$/.test(token.name)) {
    const property = token.type === 'fontFamily' ? 'fontFamily' : token.type === 'fontWeight' ? 'fontWeight' : token.name.includes('font-size') ? 'fontSize' : token.name.includes('line-height') ? 'lineHeight' : 'letterSpacing';
    return <div className={styles.typeSample} style={{ [property]: live }}>Aa</div>;
  }
  if (token.type === 'dimension' && !token.name.startsWith('shadow-')) {
    const negative = value.startsWith('-');
    // Clamp display only. The label retains the exact signed value and unit.
    return <div className={styles.measureWell} aria-hidden="true"><span className={styles.measure} data-negative={negative} style={{ inlineSize: `clamp(1px, ${negative ? value.slice(1) : value}, 100%)` }} /></div>;
  }
  return <span className={doc.small}>{token.type === 'duration' ? 'Duration' : token.type === 'cubicBezier' ? 'Easing curve' : token.type === 'transition' ? 'Duration · easing · delay' : token.type === 'number' ? 'Stack order' : token.recipe ? 'CSS output' : 'Shadow length'}</span>;
}

function TokenAlias({ token, mode }: { token: Token; mode: Mode }) {
  const refs = token.recipe ? [] : referencesOf(token.value);
  const css = token.emitted ? cssByMode[mode][token.name] : undefined;
  return <div className={styles.stack}>
    {refs.map(({ property, chain }) => <div key={`${property}:${chain.join()}`}>
      {property && <span className={doc.small}>{property} → </span>}
      {chain.map((id, i) => <React.Fragment key={id}>{i > 0 && ' → '}<Code>{breakable(id)}</Code></React.Fragment>)}
    </div>)}
    {css && (token.recipe || css.includes('var(')) && <div><span className={doc.small}>Emitted CSS</span><br /><Code>{breakable(css)}</Code></div>}
    {!refs.length && !token.recipe && <span className={doc.subtle}>Raw value</span>}
    {!token.emitted && <span className={doc.small}>Source parameter; consumed by a loop recipe, no standalone CSS variable.</span>}
  </div>;
}

export function TokenTable({ tokens, mode, caption }: { tokens: Token[]; mode: Mode; caption: string }) {
  return <div className={styles.tableWrap}>
    <table className={`${doc.table} ${styles.table}`}>
      <caption className={doc.visuallyHidden}>{caption} — {tokens.some(token => token.mode) ? mode : 'All themes'} reference</caption>
      <colgroup><col className={styles.nameColumn} /><col className={styles.valueColumn} /><col /></colgroup>
      <thead><tr><th scope="col">Token / source path</th><th scope="col">Resolved value / preview</th><th scope="col">References / CSS</th></tr></thead>
      <tbody>{tokens.map(token => <tr key={token.id}>
        <th scope="row"><div className={styles.stack}>
          <Code>{breakable(token.emitted ? `--${token.name}` : token.id)}</Code>
          {token.emitted && !token.recipe && <span className={`${doc.small} ${doc.subtle}`}>{breakable(token.id)}</span>}
          <span className={doc.small}>{token.recipe ? token.deprecated ? 'Deprecated CSS alias' : 'CSS recipe · not a DTCG token' : token.type}{token.mode ? ` · ${token.mode}` : ' · All themes'}</span>
          {token.description && <span className={doc.small}>{token.description}</span>}
          {token.originalName && <span className={`${doc.small} ${doc.subtle}`}>Figma: {breakable(token.originalName)}</span>}
        </div></th>
        <td><div className={styles.stack}><Code>{breakable(resolvedValue(token, mode))}</Code><div className={styles.preview} data-theme={mode.toLowerCase()}><TokenPreview token={token} mode={mode} /></div></div></td>
        <td><TokenAlias token={token} mode={mode} /></td>
      </tr>)}</tbody>
    </table>
  </div>;
}

function FoundationLinks({ category }: { category?: Category }) {
  return <p className={doc.small}>Design language and usage: {' '}
    {category === 'Color' ? <DocLink to="Foundations/Color" /> : category === 'Typography' ? <DocLink to="Foundations/Typography" /> : category === 'Radius' || category === 'Border' ? <DocLink to="Foundations/Radius" /> : category === 'Shadow' || category === 'Elevation' ? <DocLink to="Foundations/Elevation" /> : category === 'Motion' ? <DocLink to="Foundations/Motion" /> : <DocLink to="Foundations/Spacing" />}.
    {' '}<DocLink to="Design Tokens/Overview">Token hierarchy and usage</DocLink>.
  </p>;
}

function TypographySamples({ mode }: { mode: Mode }) {
  return <DocSection number={2} title="Typography role samples">
    <p className={doc.body}>These roles combine the separate family, size, weight, line-height, and letter-spacing tokens shown above. Paragraph spacing is a separate layout value; there are no DTCG typography composites.</p>
    <div className={styles.stack}>{roles.map(role => <div className={styles.roleSample} key={role.name}>
      <Code>{role.name}</Code>
      <p style={{ fontFamily: `var(--typography-${role.name}-font-family)`, fontSize: `var(--typography-${role.name}-font-size)`, fontWeight: `var(--typography-${role.name}-font-weight)`, lineHeight: `var(--typography-${role.name}-line-height)`, letterSpacing: `var(--typography-${role.name}-letter-spacing)` }}>Build a lasting legacy.</p>
      <span className={doc.small}>{['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'paragraph-spacing'].map(property => `${property}: ${cssByMode[mode][`typography-${role.name}-${property}`] ? resolvedValue(catalogue.find(t => t.name === `typography-${role.name}-${property}`)!, mode) : 'not defined'}`).join(' · ')}</span>
    </div>)}</div>
  </DocSection>;
}

export function TokenReference({ tier, category, family }: { tier: Tier; category?: Category; family?: string }) {
  // A theme control is useful only when this reference contains authored theme variants.
  const showThemeSwitch = tokensFor(tier, category, family, 'Light').some(token => Boolean(token.mode));
  return <TokenTheme showSwitch={showThemeSwitch}>{mode => {
    const tokens = tokensFor(tier, category, family, mode);
    const groups = [...new Set(tokens.map(token => token.group))];
    const files = [...new Set(tokens.map(token => token.file))];
    return <DocPage>
      <DocHeader title={family ? titleCase(family) : category!} lede={tierNames[tier]} context={`${tokens.filter(t => !t.recipe).length} source entries · ${tokens.filter(t => t.recipe).length} CSS recipes / compatibility aliases · ${showThemeSwitch ? mode : 'All themes'}`} />
      <p className={doc.body}>{tier === 'primitives' ? 'Raw design values. Prefer a semantic token when styling components; use this scale to understand or define semantic decisions.' : tier === 'semantic' ? 'The primary styling interface for components. References preserve the relationship to primitive values and other semantic decisions.' : 'Component-specific anatomy and geometry. Reuse semantic tokens for general styling; a component token needs independent component meaning.'}</p>
      {category === 'Shadow' && <p className={doc.body}>These primitives are individual x/y offsets, blur, and spread lengths, not complete box shadows. Complete themed shadows are in <DocLink to="Design Tokens/Tier 2: Semantic/Elevation">semantic elevation</DocLink>.</p>}
      {category === 'Motion' && <p className={doc.body}>Durations, easing, and transition composites are shown as values. Loop shorthands are CSS recipes; their source parameters are not emitted separately. No animation runs on this reference page.</p>}
      {category === 'Dimensions' && <p className={doc.body}>Bars are capped to the preview column. Numeric labels retain the exact value; negative measurements use a dashed bar. Dimensions include existing size and overlap roles.</p>}
      {family === 'skeleton' && <p className={doc.body}>The current source contains component color aliases directly to primitives. They are documented here as existing definitions; this is not a pattern for introducing redundant component color tokens.</p>}
      <FoundationLinks category={category} />
      <nav aria-label="Token groups" className={styles.jumpLinks}>{groups.map((group, index) => <a className={styles.jumpLink} key={group} href={`#token-group-${index}`} target="_self" onClick={event => event.stopPropagation()}>{titleCase(group)}</a>)}</nav>
      <DocSection number={1} title="Token reference">
        {groups.map((group, index) => <section className={styles.group} key={group} aria-labelledby={`token-group-${index}`}>
          <h3 className={doc.h3} id={`token-group-${index}`}>{titleCase(group)}</h3>
          <TokenTable caption={group} tokens={tokens.filter(token => token.group === group)} mode={mode} />
        </section>)}
      </DocSection>
      {tier === 'semantic' && category === 'Typography' && <TypographySamples mode={mode} />}
      <DocFooter>Read directly from {files.map(file => file === 'css-recipes.json' ? file : `tokens/src/${file}`).join(', ')} and the checked-in generated CSS. Run the existing token build after source changes. Source-only loop parameters are resolved from DTCG data. Calculations remain CSS expressions.</DocFooter>
    </DocPage>;
  }}</TokenTheme>;
}

export function TokenOverview({ component = false }: { component?: boolean }) {
  return <TokenTheme>{mode => <DocPage>
    <DocHeader title={component ? 'Component tokens' : 'Design tokens'} lede={component ? 'Independent meaning for component anatomy.' : 'Named design decisions, from raw values to reusable intent.'} context="A technical reference for the LegacyHQ token system." />
    <p className={doc.body}>{component ? 'Use component tokens only when a value describes component-specific anatomy, geometry, or an independently controlled decision. Do not introduce a component alias when an existing semantic token already expresses the same meaning.' : 'LegacyHQ tokens connect design intent to implementation. Source paths preserve the Figma collection and mode; CSS custom properties expose the public styling interface.'}</p>
    <DocSection number={1} title="Three tiers">
      <ol className={styles.tiers}>
        <li><h3 className={doc.h3}>{tierNames.primitives}</h3><p>Raw values and scales. Foundations for semantic decisions.</p><span className={doc.small}>{sourceTokens.filter(t => t.tier === 'primitives').length} source entries</span><span aria-hidden="true">↓</span></li>
        <li><h3 className={doc.h3}>{tierNames.semantic}</h3><p><strong>Prefer semantic tokens for component styling.</strong> They describe reusable intent and theme behavior.</p><span className={doc.small}>{sourceTokens.filter(t => t.tier === 'semantic').length} source entries, including theme variants</span><span aria-hidden="true">↓</span></li>
        <li><h3 className={doc.h3}>{tierNames.component}</h3><p>Exceptions for component-specific meaning, such as switch thumb dimensions or slider geometry.</p><span className={doc.small}>{sourceTokens.filter(t => t.tier === 'component').length} source entries across {families.length} families</span></li>
      </ol>
      <p className={doc.body}>This is a decision hierarchy, not a requirement to create a token at every tier. Existing component geometry can reference primitives directly. Shared component styling should consume semantics directly.</p>
    </DocSection>
    <DocSection number={2} title="A real relationship">
      <p className={doc.body}>The Button uses this semantic background directly. No component color token is needed.</p>
      <Code>{resolvedValue(sourceTokens.find(t => t.name === 'color-background-brand-primary-bold-default' && t.mode === mode)!, mode)} → {breakable(String(sourceTokens.find(t => t.name === 'color-background-brand-primary-bold-default' && t.mode === mode)!.value))} → --color-background-brand-primary-bold-default → Button background</Code>
      <pre className={doc.codeBlock}>{'/* Component styling: consume semantic intent */\nbackground: var(--color-background-brand-primary-bold-default);'}</pre>
      <p className={doc.body}>For independent geometry, <Code>component.switch.md.thumb-size</Code> references <Code>{String(sourceTokens.find(t => t.id === 'component.switch.md.thumb-size')!.value)}</Code>. This is a component decision, not a reusable background or spacing role.</p>
      <DocLink to="Components/Actions/Button">Button documentation</DocLink>
    </DocSection>
    <DocSection number={3} title={component ? 'Component families' : 'Browse the reference'}>
      <div className={styles.directory}>
        {!component && <>
          <div><h3 className={doc.h3}>Tier 1: Primitives</h3><p className={doc.small}>{categoriesFor('primitives').join(' · ')}</p><DocLink to="Design Tokens/Tier 1: Primitives/Color">Start with primitive color</DocLink></div>
          <div><h3 className={doc.h3}>Tier 2: Semantic</h3><p className={doc.small}>{categoriesFor('semantic').join(' · ')}</p><DocLink to="Design Tokens/Tier 2: Semantic/Color">Start with semantic color</DocLink></div>
        </>}
        <div><h3 className={doc.h3}>Tier 3: Component</h3>
          <ul className={styles.stack}>
            <li><DocLink to="Design Tokens/Tier 3: Component/Avatar" /></li>
            <li><DocLink to="Design Tokens/Tier 3: Component/Menu" /></li>
            <li><DocLink to="Design Tokens/Tier 3: Component/Progress Bar" /></li>
            <li><DocLink to="Design Tokens/Tier 3: Component/Progress Indicator" /></li>
            <li><DocLink to="Design Tokens/Tier 3: Component/Skeleton" /></li>
            <li><DocLink to="Design Tokens/Tier 3: Component/Slider" /></li>
            <li><DocLink to="Design Tokens/Tier 3: Component/Switch" /></li>
            <li><DocLink to="Design Tokens/Tier 3: Component/Tooltip" /></li>
          </ul>
        </div>
      </div>
    </DocSection>
    <DocSection number={4} title="Reading this reference">
      <p className={doc.body}>Names, values, aliases, types, Figma names, and any authored descriptions come from source JSON. Public values and emitted expressions come from generated CSS. Light/Dark changes both previews and metadata. Color alone never identifies a token.</p>
      <p className={doc.body}>CSS recipes are platform declarations, not DTCG tokens: casing compatibility, loop shorthands, calculated progress-bar dimensions, and deprecated aliases. They are labelled separately. Source-only motion parameters have no standalone CSS custom property.</p>
      <p className={doc.body}>Foundations explains design language and intended usage. This section lists the implementation reference.</p>
      <DocLink to="Foundations/Color">Explore Foundations</DocLink>
    </DocSection>
    <DocFooter>Source of truth: packages/ui/src/tokens/src/ and css-recipes.json. Style Dictionary generates tokens.css, light.css, and dark.css. Documentation uses these existing files directly; no separate token lists or new export pipeline.</DocFooter>
  </DocPage>}</TokenTheme>;
}
