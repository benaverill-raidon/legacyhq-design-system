import * as React from 'react';
import { Label } from '../../../components/atoms/label';
import type { LabelTone } from '../../../components/atoms/label';
import { IssueText, KnownIssues } from '../../blocks/component-page';
import { DocLink } from '../../blocks/doc-link';
import { Code, doc, DocFooter, DocHeader, DocPage, DocSection } from '../../blocks/doc-page';
import { STATUS_CRITERIA, STATUS_VALUES, statusCounts, statusEntries, statusLabel, statusRows } from '../../blocks/status-data';
import styles from './status.module.css';

// Introduction / Status: what each status means, the evidence it needs, and every component's
// status with what holds it back. Everything here is read from component-registry-governance.json
// (componentStatus) and registry.json; component-status.test.ts keeps both honest.

/** The Label tone for a status: meaning, as Label's tones are. */
export const STATUS_TONES: Record<string, LabelTone> = { draft: 'default', beta: 'information', stable: 'success', deprecated: 'warning' };

export function StatusLabel({ status }: { status: string }) {
  return (
    <Label size="sm" emphasis="subtle" tone={STATUS_TONES[status] ?? 'default'}>
      {statusLabel(status)}
    </Label>
  );
}

const rows = statusRows(statusEntries);
const withIssues = rows.filter(({ issues }) => issues.length > 0);
const counts = statusCounts(statusEntries);

/**
 * A link to a component's Docs page. The title is worked out from the registry, so it isn't a
 * string literal for doc-link.test.ts to read; status-data's test checks every title instead.
 */
const ComponentLink = ({ title, name }: { title: string; name: string }) => React.createElement(DocLink, { to: title }, name);

export function Status() {
  return (
    <DocPage>
      <DocHeader
        title="Status"
        lede="How ready each component is to build with. Every component has one of four statuses, written in its contract and checked against the evidence below, so a status never claims more than the system can show."
        context={counts.map(({ label, count }) => `${count} ${label}`).join(' · ')}
      />

      <DocSection number={1} title="The statuses">
        <table className={doc.table}>
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">What it means</th>
            </tr>
          </thead>
          <tbody>
            {STATUS_VALUES.map(({ value, meaning }) => (
              <tr key={value}>
                <th scope="row">
                  <StatusLabel status={value} />
                </th>
                <td>
                  <IssueText summary={meaning} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DocSection>

      <DocSection number={2} title="What each status needs">
        <p className={doc.body}>
          Beta needs the first three; Stable needs all six. People can give a component a lower status than its
          evidence allows, when they know its API or design is about to change, but never a higher one: the test
          fails. Known limitations, a component&apos;s designed boundaries, don&apos;t count against it; known issues
          do.
        </p>
        <div className={styles.tableScroll}>
          <table className={doc.table}>
            <thead>
              <tr>
                <th scope="col">Evidence</th>
                <th scope="col">Needed for</th>
                <th scope="col">How it&apos;s checked</th>
              </tr>
            </thead>
            <tbody>
              {STATUS_CRITERIA.map(({ id, needs, label, checkedBy }) => (
                <tr key={id}>
                  <th scope="row">{label}</th>
                  <td>
                    <StatusLabel status={needs} />
                  </td>
                  <td>
                    <IssueText summary={checkedBy} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection number={3} title="Every component">
        <div className={styles.tableScroll}>
          <table className={`${doc.table} ${styles.components}`}>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Group</th>
                <th scope="col">Status</th>
                <th scope="col">Stable still needs</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, name, title, group, status, missing, issues }) => (
                <tr key={id}>
                  <th scope="row">
                    <ComponentLink title={title} name={name} />
                  </th>
                  <td>{group}</td>
                  <td>
                    <StatusLabel status={status} />
                  </td>
                  <td>
                    {[...missing, ...(issues.length ? [`${issues.length} known ${issues.length === 1 ? 'issue' : 'issues'}`] : [])].join(', ') || (
                      <span className={doc.subtle}>Nothing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection number={4} title="Known issues">
        <p className={doc.body}>
          What holds each component below Stable, from <Code>knownIssues</Code> in its contract: bugs, gaps, and decisions
          still to make. Each one also shows under its component&apos;s Docs page header.
        </p>
        <div className={styles.issueList}>
          {withIssues.map(({ id, name, title, issues }) => (
            <div key={id} className={styles.issueGroup}>
              <h3 className={doc.h3}>
                <ComponentLink title={title} name={name} />
              </h3>
              <KnownIssues issues={issues} />
            </div>
          ))}
        </div>
      </DocSection>

      <DocFooter>
        Statuses and known issues are authored in each component&apos;s <Code>contract.json</Code>. The rules are{' '}
        <Code>componentStatus</Code> in <Code>component-registry-governance.json</Code>. Patterns and templates have no status;
        the templates say on their pages that they&apos;re drafts.{' '}
        <DocLink size="sm" to="Introduction/Overview">
          Back to the Overview
        </DocLink>
        .
      </DocFooter>
    </DocPage>
  );
}
