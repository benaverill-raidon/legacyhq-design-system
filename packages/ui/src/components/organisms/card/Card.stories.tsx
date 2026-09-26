import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../atoms/button';
import { Badge } from '../../atoms/badge';
import { Field } from '../../molecules/field';
import { TextField } from '../../molecules/text-field';
import { Form, FormSection, FormFooter } from '../form';
import { Card } from './card';
import type { CardSurface, CardBorderRadius } from './card.types';
import styles from './card-stories.module.css';

const surfaces: CardSurface[] = ['raised', 'default', 'sunken', 'deep', 'none'];
const radii: CardBorderRadius[] = ['lg', 'xl', 'xxl'];
const radiusLabels = { lg: '8px', xl: '12px', xxl: '16px' };

const meta = {
  title: 'UI/Organisms/Card',
  component: Card,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div className={styles.preview}><Story /></div>],
  args: { surface: 'raised', border: true, borderRadius: 'lg' },
  argTypes: {
    surface: { control: 'select', options: surfaces },
    border: { control: 'boolean' },
    borderRadius: { control: 'select', options: radii },
    children: { control: false },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Card {...args} className={styles.example}>
    <section className={styles.content} aria-labelledby="card-playground-title">
      <h2 id="card-playground-title" className={styles.heading}>Project overview</h2>
      <p className={styles.description}>A surface for whatever your project needs.</p>
    </section>
  </Card>,
};

export const AllVariants: Story = {
  render: () => <div className={styles.variants}>
    {[true, false].map((border) => <section key={String(border)} className={styles.variants}>
      <h2 className={styles.heading}>{border ? 'With border' : 'Without border'}</h2>
      {surfaces.map((surface) => <section key={surface} className={styles.variantRow} aria-label={`${surface} surface, ${border ? 'with' : 'without'} border`}>
      <h3 className={styles.label}>{surface}</h3>
      <div className={styles.samples}>
        {radii.map((borderRadius) => <div key={borderRadius} className={styles.sample}>
          <p className={styles.description}>{borderRadius} · {radiusLabels[borderRadius]}</p>
          <Card surface={surface} border={border} borderRadius={borderRadius} className={styles.swatch}>
            {surface === 'none' ? <p className={styles.inset}>Transparent</p> : null}
          </Card>
        </div>)}
      </div>
      </section>)}
    </section>)}
  </div>,
};

export const NoSurface: Story = {
  render: (args) => <div className={styles.backdrop}>
    {[true, false].map((border) => <Card {...args} key={String(border)} surface="none" border={border}>
      <div className={styles.content}>
        <h2 className={styles.heading}>{border ? 'Border only' : 'Content only'}</h2>
        <p className={styles.description}>The background behind this card shows through. Rounded clipping still applies.</p>
      </div>
    </Card>)}
  </div>,
};

export const ContentSlot: Story = {
  render: () => <div className={styles.compositions}>
    <Card borderRadius="xl">
      <article className={styles.content}>
        <Badge tone="success">On track</Badge>
        <h2 className={styles.heading}>Community projects</h2>
        <p className={styles.description}>Bring updates, metrics, and actions together in one place.</p>
        <dl className={styles.metrics}>
          <div><dt>Active projects</dt><dd>12</dd></div>
          <div><dt>Volunteers</dt><dd>48</dd></div>
        </dl>
      </article>
    </Card>
    <Card surface="sunken" borderRadius="xxl">
      <section className={styles.content} aria-labelledby="card-checklist-title">
        <h2 id="card-checklist-title" className={styles.heading}>Before you begin</h2>
        <ul className={styles.list}>
          <li>Choose a project.</li>
          <li>Invite your team.</li>
          <li>Share your first update.</li>
        </ul>
        <Card surface="raised"><p className={styles.inset}>Cards can hold other cards, too.</p></Card>
      </section>
    </Card>
  </div>,
};

export const EdgeToEdge: Story = {
  render: () => <Card borderRadius="xxl" className={styles.example}>
    <div className={styles.banner} aria-hidden="true" />
    <section className={styles.content} aria-labelledby="card-media-title">
      <h2 id="card-media-title" className={styles.heading}>Room for something new</h2>
      <p className={styles.description}>Content can meet the edges. Add padding only where it belongs.</p>
    </section>
  </Card>,
};

export const WithForm: Story = {
  render: function FormExample(args) {
    const [name, setName] = useState('Community garden');
    const [savedName, setSavedName] = useState<string>();
    return <Card {...args} className={styles.example}>
      <div className={styles.content}>
        <Form title={<h2 className={styles.heading}>Project settings</h2>}
          onSubmit={(event) => { event.preventDefault(); setSavedName(name); }}>
          <FormSection>
            <Field label="Project name" required>
              <TextField value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
          </FormSection>
          <FormFooter><Button type="submit" prominence="primary">Save changes</Button></FormFooter>
        </Form>
        <p className={styles.description} role="status">{savedName ? `Saved ${savedName}.` : 'Changes are saved for this example only.'}</p>
      </div>
    </Card>;
  },
};
