import * as React from 'react';
import { logoFullSvg, logoMarkSvg, logoWordmarkSvg } from '../../../assets/logos';
import styles from './Logo.module.css';
import type { LogoProps, LogoType } from './Logo.types';

const logoSvgByType: Record<LogoType, string> = {
  mark: logoMarkSvg,
  wordmark: logoWordmarkSvg,
  full: logoFullSvg,
};

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildLogoSvg(svg: string, label: string, decorative: boolean) {
  const accessibilityAttributes = decorative
    ? 'aria-hidden="true"'
    : `role="img" aria-label="${escapeAttribute(label)}"`;

  return svg.replace('<svg ', `<svg class="${styles.svg}" focusable="false" ${accessibilityAttributes} `);
}

export const Logo = React.memo(function Logo({
  type = 'full',
  size = 'md',
  title,
  ariaLabel,
  decorative = false,
  className,
}: LogoProps) {
  const label = ariaLabel || title || 'LegacyHQ';
  const svgMarkup = React.useMemo(
    () => buildLogoSvg(logoSvgByType[type], label, decorative),
    [decorative, label, type],
  );
  const classNames = mergeClassNames(styles.logo, styles[`size_${size}`], styles[`type_${type}`], className);

  return (
    <span
      className={classNames}
      data-logo-type={type}
      data-logo-size={size}
      aria-hidden={decorative ? true : undefined}
      title={title}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
});

Logo.displayName = 'Logo';
