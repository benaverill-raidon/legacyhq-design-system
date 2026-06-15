import type { ComponentType, CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import iconMetadata from '../../../assets/icons/metadata/icons.json';
import * as generatedIcons from '../../../assets/icons/generated';
import { AddIcon } from '../../../assets/icons';
import type { IconColor, IconProps, IconSize, IconSpacing } from './icon.types';

type IconMetadata = {
  name: string;
  component: string;
  category: 'multi-purpose' | 'single-purpose';
  keywords: string[];
  label: string;
};

const sizes: IconSize[] = ['sm', 'md'];
const spacings: IconSpacing[] = ['none', 'spacious'];
const colors: IconColor[] = [
  'default',
  'subtle',
  'inverse',
  'brand',
  'success',
  'warning',
  'error',
  'information',
  'disabled',
];

const metadata = iconMetadata as IconMetadata[];
const iconComponents = generatedIcons as Record<string, ComponentType<IconProps>>;
const iconNames = metadata.map((icon) => icon.name);

const meta: Meta<typeof AddIcon> = {
  title: 'UI/Primitives/Icon',
  component: AddIcon,
  args: {
    size: 'md',
    spacing: 'none',
    color: 'default',
    decorative: true,
  },
  argTypes: {
    size: { control: 'radio', options: sizes },
    spacing: { control: 'radio', options: spacings },
    color: { control: 'select', options: colors },
    decorative: { control: 'boolean' },
    title: { control: 'text' },
    className: { control: false },
    testId: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Icons are generated as individual React components from SVG source files. Use generated components directly for tree-shaking, keep icons non-interactive, and use semantic content color tokens only.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof AddIcon>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const sectionStyle = {
  display: 'grid',
  gap: 'var(--spacing-100)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-150)',
} satisfies CSSProperties;

const galleryStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 'var(--spacing-100)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const itemStyle = {
  display: 'grid',
  gridTemplateColumns: 'var(--spacing-300) 1fr',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  minInlineSize: 0,
  padding: 'var(--spacing-075)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-sm)',
  background: 'var(--color-elevation-surface-default)',
} satisfies CSSProperties;

const labelStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--typography-body-sm-font-family)',
  fontSize: 'var(--typography-body-sm-font-size)',
  fontWeight: 'var(--typography-body-sm-font-weight)',
  lineHeight: 'var(--typography-body-sm-line-height)',
} satisfies CSSProperties;

const inverseSurfaceStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--spacing-150)',
  alignItems: 'center',
  padding: 'var(--spacing-200)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

function getIconComponent(componentName: string) {
  return iconComponents[componentName] ?? AddIcon;
}

function IconGallery({ category }: { category: IconMetadata['category'] }) {
  const icons = metadata.filter((icon) => icon.category === category);

  return (
    <div style={galleryStyle}>
      {icons.map((icon) => {
        const Component = getIconComponent(icon.component);

        return (
          <div key={icon.name} style={itemStyle} title={`${icon.label}: ${icon.name}`}>
            <Component spacing="spacious" />
            <span style={labelStyle}>{icon.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export const Playground: Story = {
  argTypes: {
    icon: { control: 'select', options: iconNames },
  } as Record<string, unknown>,
  args: {
    icon: 'add',
  } as IconProps & { icon: string },
  render: ({ icon = 'add', ...args }: IconProps & { icon?: string }) => {
    const selected = metadata.find((entry) => entry.name === icon) ?? metadata[0];
    const Component = getIconComponent(selected.component);

    return <Component {...args} title={args.decorative ? undefined : selected.label} />;
  },
};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <section style={sectionStyle}>
        <strong>Sizes</strong>
        <div style={rowStyle}>
          {sizes.map((size) => (
            <span key={size} style={rowStyle}>
              <AddIcon size={size} />
              <span>{size}</span>
            </span>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <strong>Spacing</strong>
        <div style={rowStyle}>
          {spacings.map((spacing) => (
            <span key={spacing} style={rowStyle}>
              <AddIcon spacing={spacing} />
              <span>{spacing}</span>
            </span>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <strong>Colors</strong>
        <div style={rowStyle}>
          {colors.map((color) => (
            <span key={color} style={rowStyle}>
              <AddIcon color={color} />
              <span>{color}</span>
            </span>
          ))}
        </div>
      </section>

      <div style={inverseSurfaceStyle}>
        <AddIcon color="inverse" />
        <span>Inverse color on a dark surface</span>
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <section style={sectionStyle}>
        <strong>Multi-purpose icons</strong>
        <IconGallery category="multi-purpose" />
      </section>

      <section style={sectionStyle}>
        <strong>Single-purpose icons</strong>
        <IconGallery category="single-purpose" />
      </section>
    </div>
  ),
};
