import * as React from 'react';
import { Button } from '../../../components/atoms/button';
import { Label } from '../../../components/atoms/label';
import type { LabelTone } from '../../../components/atoms/label';
import { Card } from '../../../components/organisms/card';
import buttonCss from '../../../components/atoms/button/button.module.css?raw';
import { DocLink } from '../../blocks/doc-link';
import { breakable, Code, doc, DocFooter, DocHeader, DocPage, DocSection, DocSubsection } from '../../blocks/doc-page';
import { componentCount, componentGroups, findComponentRule, tokenTrace } from './overview-data';
import styles from './overview.module.css';

const componentRule = findComponentRule(buttonCss);

type Status = 'Available' | 'In progress' | 'Planned';

const statusTone: Record<Status, LabelTone> = {
  Available: 'success',
  'In progress': 'information',
  Planned: 'default',
};

const audiences = [
  {
    name: 'Designers',
    text: 'Foundations and components that map directly to what ships in code, so each design decision has one source.',
  },
  {
    name: 'Engineers',
    text: 'Tested React components and the tokens beneath them, with guidance on when to use each.',
  },
  {
    name: 'AI-assisted workflows',
    text: 'Machine-readable contracts and indexes that describe every component precisely enough to build with.',
  },
];

function WhySection() {
  return (
    <DocSection number={1} title="What it is and why it exists">
      <div className={styles.prose}>
        <p className={doc.body}>
          LegacyHQ’s interface grew across several approaches: MUI, Tailwind, custom CSS, and one-off implementations.
          Each met a local need. Together, they let the same pattern look and behave differently from screen to screen,
          and meant the same decisions were made and built more than once.
        </p>
        <p className={doc.body}>
          The design system is the response: one shared language for design and code. Visual decisions start in Figma as
          design tokens and carry through to the React components teams build with. Guidance for using them lives here,
          next to working examples. The system is progressively replacing legacy patterns across LegacyHQ.
        </p>
      </div>
      <ul className={styles.grid3} aria-label="Who the system serves">
        {audiences.map(({ name, text }) => (
          <li key={name}>
            <Card className={styles.card}>
              <h3 className={doc.title}>{name}</h3>
              <p className={doc.small}>{text}</p>
            </Card>
          </li>
        ))}
      </ul>
    </DocSection>
  );
}

const stages: Array<{ name: string; role: string; description: React.ReactNode; livesIn: React.ReactNode; guardrail?: React.ReactNode }> = [
  {
    name: 'Figma',
    role: 'Design source',
    description:
      'Components and variables are designed in the Components v1.0.0 library. Variables are organized into primitive, semantic, and component collections, with Light and Dark modes.',
    livesIn: 'Figma, Components v1.0.0',
    guardrail: 'Every component’s contract records the Figma component it implements.',
  },
  {
    name: 'Design tokens',
    role: 'Repository source',
    description:
      'Tokens are stored as standard DTCG JSON in three tiers: primitive values, semantic intent, and component-level exceptions. Each token keeps its original Figma name.',
    livesIn: <Code>{breakable('packages/ui/src/tokens/src')}</Code>,
    guardrail: (
      <>
        <Code>npm run tokens:check</Code> validates every token, reference, and type. It runs in CI on every pull
        request and push to master.
      </>
    ),
  },
  {
    name: 'CSS variables',
    role: 'Generated output',
    description:
      'Style Dictionary compiles the token source into CSS custom properties: shared values, a Light theme, and a Dark theme.',
    livesIn: (
      <>
        <Code>tokens.css</Code> · <Code>light.css</Code> · <Code>dark.css</Code>
      </>
    ),
    guardrail: (
      <>
        Never edited by hand; in CI, <Code>tokens:check</Code> also confirms the output is current and resolves in both
        themes.
      </>
    ),
  },
  {
    name: 'React components',
    role: 'Implementation',
    description: 'TypeScript components built on native HTML elements and styled with CSS Modules that reference design tokens.',
    livesIn: <Code>{breakable('packages/ui/src/components')}</Code>,
    guardrail:
      'Stylelint rejects raw color, type, spacing, and radius values. ESLint enforces accessibility rules, and Vitest covers behavior. All three run in CI on every pull request and push to master.',
  },
  {
    name: 'Storybook',
    role: 'Documentation',
    description: 'Live examples for every component, with usage guidance, API references, and an accessibility check on each story.',
    livesIn: 'This Storybook',
    guardrail: 'Tests keep each component’s place in the sidebar in sync with its contract and check that internal links point to real pages.',
  },
  {
    name: 'LegacyHQ product',
    role: 'Adoption',
    description: 'Migration in progress. The system is progressively replacing legacy implementation patterns across LegacyHQ.',
    livesIn: 'The LegacyHQ application',
  },
];

function Pipeline() {
  return (
    <>
      <ol className={styles.stages}>
        {stages.map(({ name, role, description, livesIn, guardrail }, index) => (
          <li key={name} className={styles.stage}>
            <Card className={styles.stageCard}>
              <p className={doc.eyebrow}>
                <span className={styles.stageNumber}>{String(index + 1).padStart(2, '0')}</span> {role}
              </p>
              <h3 className={doc.title}>{name}</h3>
              <p className={doc.small}>{description}</p>
              {/* Stacked rather than Key Value Pair, whose side-by-side row is too narrow inside a card. */}
              <dl className={styles.stageFacts}>
                <div>
                  <dt className={doc.eyebrow}>Lives in</dt>
                  <dd className={doc.small}>{livesIn}</dd>
                </div>
                {guardrail && (
                  <div>
                    <dt className={doc.eyebrow}>Guardrail</dt>
                    <dd className={doc.small}>{guardrail}</dd>
                  </div>
                )}
              </dl>
            </Card>
          </li>
        ))}
      </ol>
      <Card surface="sunken" border={false} className={styles.card}>
        <p className={doc.small}>
          <strong className={doc.strong}>Machine-readable layer.</strong> Each component also has a contract describing its
          props, anatomy, tokens, and accessibility requirements. Generated indexes make the whole system queryable:
        </p>
        <p className={doc.small}>
          <Code>{'<component>.contract.json'}</Code> → <Code>registry.json</Code> · <Code>exemplars.json</Code>, indexed by{' '}
          <Code>llms.txt</Code>, with conventions in <Code>CLAUDE.md</Code>.
        </p>
      </Card>
    </>
  );
}

const primitiveName = (reference: string | undefined) => reference?.replace(/^\{Primitive\.Value\./, '').replace(/\}$/, '');

function useCssVariable(ref: React.RefObject<HTMLElement | null>, name: string) {
  const [value, setValue] = React.useState<string>();
  React.useEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).getPropertyValue(name).trim().toUpperCase());
  }, [ref, name]);
  return value;
}

function TokenTrace() {
  const lightRef = React.useRef<HTMLDivElement>(null);
  const darkRef = React.useRef<HTMLDivElement>(null);
  const resolved = {
    Light: useCssVariable(lightRef, tokenTrace.cssVariable),
    Dark: useCssVariable(darkRef, tokenTrace.cssVariable),
  };
  const rule = componentRule;

  return (
    <DocSubsection title="One token, end to end">
      <p className={doc.body}>
        A real token, followed from Figma to a rendered button. Values are read from the token source and the live CSS, so
        this example always reflects the current system.
      </p>
      <ol className={styles.traceSteps}>
        <li className={styles.traceStep}>
          <p className={doc.eyebrow}>Figma variable</p>
          <p className={styles.traceValue}>
            <Code>{breakable(tokenTrace.figmaName ?? '')}</Code>
          </p>
          <p className={doc.small}>
            Collection: {tokenTrace.collection} · Modes: {tokenTrace.modes.map(({ mode }) => mode).join(', ')}
          </p>
        </li>
        <li className={styles.traceStep}>
          <p className={doc.eyebrow}>Design token</p>
          <p className={styles.traceValue}>
            <Code>{breakable(tokenTrace.token)}</Code>
          </p>
          <ul className={styles.traceModes}>
            {tokenTrace.modes.map(({ mode, reference }) => (
              <li key={mode} className={doc.small}>
                {mode} → <Code>{breakable(primitiveName(reference) ?? '')}</Code>
              </li>
            ))}
          </ul>
        </li>
        <li className={styles.traceStep}>
          <p className={doc.eyebrow}>CSS variable</p>
          <p className={styles.traceValue}>
            <Code>{breakable(tokenTrace.cssVariable)}</Code>
          </p>
          <ul className={styles.traceModes}>
            {tokenTrace.modes.map(({ mode }) => (
              <li key={mode} className={doc.small}>
                {mode}{' '}
                <span className={styles.swatch} data-theme={mode === 'Dark' ? 'dark' : undefined} aria-hidden="true" />{' '}
                <Code>{resolved[mode] ?? '…'}</Code>
              </li>
            ))}
          </ul>
        </li>
        <li className={styles.traceStep}>
          <p className={doc.eyebrow}>Component</p>
          <p className={doc.title}>Button</p>
          {rule && (
            <pre className={doc.codeBlock}>
              <code>
                {rule.selector} {'{'}
                {'\n  '}
                {breakable(rule.declaration)}
                {'\n}'}
              </code>
            </pre>
          )}
        </li>
      </ol>
      <div className={styles.traceResult}>
        <div ref={lightRef} className={styles.themePanel}>
          <p className={`${doc.eyebrow} ${styles.panelLabel}`}>Light</p>
          <Button prominence="primary">Save changes</Button>
        </div>
        <div ref={darkRef} className={styles.themePanel} data-theme="dark">
          <p className={`${doc.eyebrow} ${styles.panelLabel}`}>Dark</p>
          <Button prominence="primary">Save changes</Button>
        </div>
      </div>
      <p className={doc.caption}>
        Button never references Prussian 900 directly. It uses the semantic token, so remapping that token or switching
        theme updates the button without any change to component code.
      </p>
    </DocSubsection>
  );
}

const sections: Array<{ name: string; status: Status; purpose: React.ReactNode; availableNow?: React.ReactNode }> = [
  {
    name: 'Introduction',
    status: 'In progress',
    purpose: 'Orientation: what the system is, how it’s built, and how to use these docs.',
    availableNow: 'Overview',
  },
  {
    name: 'Foundations',
    status: 'In progress',
    purpose: 'The tokens and system assets every component is built from.',
    availableNow: (
      <>
        <DocLink size="sm" to="Foundations/Color" /> · <DocLink size="sm" to="Foundations/Typography" /> ·{' '}
        <DocLink size="sm" to="Foundations/Icons" /> · <DocLink size="sm" to="Foundations/Focus Ring" /> ·{' '}
        <DocLink size="sm" to="Foundations/Logo" />
      </>
    ),
  },
  {
    name: 'Components',
    status: 'Available',
    purpose: `${componentCount} React components for building LegacyHQ interfaces, with live examples and usage guidance.`,
    availableNow: 'Six groups, below',
  },
  {
    name: 'Patterns',
    status: 'Planned',
    purpose: 'Guidance for combining components to solve recurring product problems.',
  },
  {
    name: 'Templates',
    status: 'Planned',
    purpose: 'Complete LegacyHQ workflows composed entirely from system components.',
  },
];

function SectionIndex() {
  return (
    <table className={styles.sectionTable}>
      <thead>
        <tr>
          <th scope="col">Section</th>
          <th scope="col">Status</th>
          <th scope="col">Purpose</th>
          <th scope="col">Available now</th>
        </tr>
      </thead>
      <tbody>
        {sections.map(({ name, status, purpose, availableNow }) => (
          <tr key={name}>
            <th scope="row" className={doc.title}>
              {name}
            </th>
            <td>
              <Label size="sm" emphasis="subtle" tone={statusTone[status]}>
                {status}
              </Label>
            </td>
            <td>{purpose}</td>
            <td className={doc.subtle}>{availableNow ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Hand-picked entry points per group; the label, definition, and count come from overview-data.
const groupExamples: Record<string, React.ReactNode[]> = {
  actions: [
    <DocLink key="button" size="sm" to="Components/Actions/Button" />,
    <DocLink key="icon-button" size="sm" to="Components/Actions/Icon Button" />,
    <DocLink key="split-button" size="sm" to="Components/Actions/Split Button" />,
    <DocLink key="dropdown-menu" size="sm" to="Components/Actions/Dropdown Menu" />,
  ],
  forms: [
    <DocLink key="text-field" size="sm" to="Components/Forms/Text Field" />,
    <DocLink key="select" size="sm" to="Components/Forms/Select" />,
    <DocLink key="checkbox" size="sm" to="Components/Forms/Checkbox" />,
    <DocLink key="date-picker" size="sm" to="Components/Forms/Date Picker" />,
  ],
  feedback: [
    <DocLink key="banner" size="sm" to="Components/Feedback/Banner" />,
    <DocLink key="section-message" size="sm" to="Components/Feedback/Section Message" />,
    <DocLink key="toast" size="sm" to="Components/Feedback/Toast" />,
    <DocLink key="spinner" size="sm" to="Components/Feedback/Spinner" />,
  ],
  navigation: [
    <DocLink key="tabs" size="sm" to="Components/Navigation/Tabs" />,
    <DocLink key="breadcrumbs" size="sm" to="Components/Navigation/Breadcrumbs" />,
    <DocLink key="pagination" size="sm" to="Components/Navigation/Pagination" />,
    <DocLink key="link" size="sm" to="Components/Navigation/Link" />,
  ],
  'data-display': [
    <DocLink key="table" size="sm" to="Components/Data Display/Table" />,
    <DocLink key="card" size="sm" to="Components/Data Display/Card" />,
    <DocLink key="tag" size="sm" to="Components/Data Display/Tag" />,
    <DocLink key="avatar" size="sm" to="Components/Data Display/Avatar" />,
  ],
  overlays: [
    <DocLink key="modal-dialog" size="sm" to="Components/Overlays/Modal Dialog" />,
    <DocLink key="tooltip" size="sm" to="Components/Overlays/Tooltip" />,
    <DocLink key="popup" size="sm" to="Components/Overlays/Popup" />,
  ],
};

function ComponentGroups() {
  return (
    <DocSubsection title="Component groups">
      <p className={doc.body}>
        Components are grouped by the job they do. In code they’re organized by compositional tier (primitive, atom,
        molecule, organism), but finding the right component starts with what you need it to do.
      </p>
      <ul className={styles.grid3}>
        {componentGroups.map(({ category, label, definition, count }) => {
          const examples = groupExamples[category] ?? [];
          const more = count - examples.length;
          return (
            <li key={category}>
              <Card className={styles.card}>
                <h4 className={styles.groupTitle}>
                  <span className={doc.title}>{label}</span>
                  <span className={`${doc.small} ${doc.subtle} ${styles.count}`}>{count}</span>
                </h4>
                <p className={doc.small}>{definition}</p>
                <p className={`${doc.small} ${styles.examples}`}>
                  {examples.map((example, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && ' · '}
                      {example}
                    </React.Fragment>
                  ))}
                  {more > 0 && (
                    <>
                      {' · '}
                      <span className={styles.more}>+{more} more</span>
                    </>
                  )}
                </p>
              </Card>
            </li>
          );
        })}
      </ul>
    </DocSubsection>
  );
}

const nextSteps: Array<{ audience: string; items: Array<{ entry: React.ReactNode; description: string }> }> = [
  {
    audience: 'Designers',
    items: [
      { entry: <DocLink to="Foundations/Icons" />, description: 'The system icon set and how to use it.' },
      {
        entry: <DocLink to="Components/Actions/Button" />,
        description: 'A complete component page, with usage, anatomy, and do’s and don’ts.',
      },
      { entry: 'Design source', description: 'The Components v1.0.0 Figma library.' },
    ],
  },
  {
    audience: 'Engineers',
    items: [
      { entry: <DocLink to="Components/Actions/Button" />, description: 'The reference implementation and its API.' },
      { entry: <DocLink to="Components/Forms/Form" />, description: 'How fields, controls, and actions fit together.' },
      {
        entry: <Code>npm run validate</Code>,
        description: 'Type, lint, style, and test checks. Run it before calling a change done.',
      },
    ],
  },
  {
    audience: 'AI-assisted workflows',
    items: [
      { entry: <Code>llms.txt</Code>, description: 'The entry point, with a component index and which file to read for each task.' },
      { entry: <Code>CLAUDE.md</Code>, description: 'Repository conventions, token tiers, and naming rules.' },
      { entry: <Code>registry.json</Code>, description: 'Every component’s props, anatomy, and category in one normalized file.' },
      { entry: <Code>exemplars.json</Code>, description: 'Runnable usage examples and anti-patterns.' },
    ],
  },
];

function NextSteps() {
  return (
    <div className={styles.grid3}>
      {nextSteps.map(({ audience, items }) => (
        <div key={audience} className={styles.nextColumn}>
          <h3 className={doc.title}>{audience}</h3>
          <ul className={styles.nextList}>
            {items.map(({ entry, description }, index) => (
              <li key={index}>
                <span className={styles.nextEntry}>{entry}</span>
                <span className={`${doc.small} ${styles.nextDescription}`}>{description}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Overview() {
  return (
    <DocPage>
      <DocHeader
        title="LegacyHQ Design System"
        lede="The shared foundations, components, and guidance used to design and build LegacyHQ."
        context="LegacyHQ is a platform for estate-planning and wealth-management teams to manage families, planning workflows, documents, relationships, and ongoing client work in one place."
      />
      <WhySection />
      <DocSection number={2} title="From design to production">
        <p className={doc.body}>
          The design system provides a shared path from design decisions in Figma to implementation in the product. Each
          stage has a defined source and set of checks that help keep the system consistent.
        </p>
        <Pipeline />
        <TokenTrace />
      </DocSection>
      <DocSection number={3} title="How these docs are organized">
        <p className={doc.body}>Five sections, from orientation to complete workflows. Status shows what’s ready today.</p>
        <SectionIndex />
        <ComponentGroups />
      </DocSection>
      <DocSection number={4} title="Where to go next">
        <NextSteps />
      </DocSection>
      <DocFooter>
        This page reads from the system itself: section groups and definitions from{' '}
        <Code>component-registry-governance.json</Code>, component counts from <Code>registry.json</Code>, and the token
        example from the DTCG source and live CSS.
      </DocFooter>
    </DocPage>
  );
}
