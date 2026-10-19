import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../../components/atoms/button';
import { LinkButton } from '../../../components/atoms/link-button';
import { ButtonGroup } from '../../../components/molecules/button-group';
import { Field } from '../../../components/molecules/field';
import { InlineMessage } from '../../../components/molecules/inline-message';
import { TextField } from '../../../components/molecules/text-field';
import { Banner } from '../../../components/organisms/banner';
import { Form, FormFooter, FormRow, FormSection } from '../../../components/organisms/form';
import { ModalDialog } from '../../../components/organisms/modal-dialog';
import { SectionMessage } from '../../../components/organisms/section-message';
import { toast, ToastGroup } from '../../../components/organisms/toast-group';
import styles from './messages-and-feedback.module.css';

// Examples for Patterns / Messages and Feedback, built only from system components. The local
// stylesheet lays them out; it never restyles a component. The pattern page lists every component
// imported here as "Components used".

const meta = {
  title: 'Patterns/Messages and Feedback',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each message at its own scope: the page, a form, one status, one control. */
export const AtTheirScope: Story = {
  render: () => (
    <div className={styles.page}>
      <Banner tone="warning">Filing is unavailable on Saturday from 10 PM to midnight for scheduled maintenance.</Banner>
      <div className={styles.body}>
        <Form title="Filing details">
          <FormSection>
            <SectionMessage
              tone="warning"
              title="Two documents are missing signatures"
              actions={
                <ButtonGroup>
                  <LinkButton href="#review" appearance="subtle" size="sm">
                    Review documents
                  </LinkButton>
                </ButtonGroup>
              }
            >
              The filing can&apos;t be submitted until every document in the package is signed.
            </SectionMessage>
          </FormSection>
          <FormSection title="Case">
            <FormRow>
              <Field label="Case number" state="error" message="Enter the case number as it appears on the court notice, such as 2026-CV-01482.">
                <TextField invalid defaultValue="01482" />
              </Field>
              <Field label="Court" message="The court the filing goes to.">
                <TextField defaultValue="Superior Court of New Jersey" />
              </Field>
            </FormRow>
          </FormSection>
          <FormFooter align="start">
            <Button prominence="primary">Submit filing</Button>
            <InlineMessage tone="success" title="Draft saved" secondaryText="2 minutes ago" />
          </FormFooter>
        </Form>
      </div>
    </div>
  ),
};

/** A confirmation from a toast, and a dialog before an action that can't be undone. */
export const Confirmations: Story = {
  render: function Render() {
    const [confirming, setConfirming] = React.useState(false);
    const deleteMatter = () => {
      setConfirming(false);
      toast('Matter deleted', { description: 'Rivera v. Atlantic Insurance and its documents were deleted.' });
    };
    const upload = () => {
      const id = toast.loading('Uploading engagement-letter.pdf…');
      window.setTimeout(() => toast.success('engagement-letter.pdf uploaded', { id }), 2000);
    };
    return (
      <>
        <ButtonGroup>
          <Button prominence="primary" onClick={() => toast.success('Changes saved')}>
            Save changes
          </Button>
          <Button onClick={upload}>Upload a document</Button>
          <Button prominence="secondary" tone="error" onClick={() => setConfirming(true)}>
            Delete matter
          </Button>
        </ButtonGroup>
        <ModalDialog
          open={confirming}
          onClose={() => setConfirming(false)}
          tone="error"
          title="Delete this matter?"
          footer={
            <ButtonGroup>
              <Button prominence="tertiary" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button prominence="primary" tone="error" onClick={deleteMatter}>
                Delete matter
              </Button>
            </ButtonGroup>
          }
        >
          This deletes Rivera v. Atlantic Insurance, its documents, and its history. You can&apos;t undo it.
        </ModalDialog>
        <ToastGroup />
      </>
    );
  },
};

/** A failure people have to fix stays on the page, beside what failed, until it's dealt with. */
export const FailureThatStays: Story = {
  render: function Render() {
    const [failed, setFailed] = React.useState(false);
    return (
      <div className={styles.body}>
        {failed && (
          <SectionMessage
            tone="error"
            title="The filing wasn't submitted"
            actions={
              <ButtonGroup>
                <LinkButton href="#review" appearance="subtle" size="sm">
                  Review documents
                </LinkButton>
              </ButtonGroup>
            }
          >
            The court returned two documents without a signature page. Sign them, then submit again.
          </SectionMessage>
        )}
        <ButtonGroup>
          <Button prominence="primary" onClick={() => setFailed(true)}>
            Submit filing
          </Button>
        </ButtonGroup>
      </div>
    );
  },
};
