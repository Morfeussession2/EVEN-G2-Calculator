import * as React from 'react';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

const registry = new Map<string, IconComponent>();

/** Register an SVG icon component under a name. */
export function registerIcon(name: string, component: IconComponent) {
  registry.set(name, component);
}

/** Register multiple icons at once. */
export function registerIcons(icons: Record<string, IconComponent>) {
  for (const [name, component] of Object.entries(icons)) {
    registry.set(name, component);
  }
}

/** Register all built-in Even Realities pixel-art icons. */
export async function registerAllIcons() {
  const { allIcons } = await import('./svg-icons');
  registerIcons(allIcons);
}

/** Get all registered icon names. */
export function getIconNames(): string[] {
  return Array.from(registry.keys());
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
}

/**
 * Renders a registered SVG icon by name.
 *
 * Usage:
 * ```tsx
 * import { Icon, registerIcons } from 'even-toolkit/web/icons';
 * import { allIcons } from 'even-toolkit/web/icons/svg-icons';
 * registerIcons(allIcons);
 * <Icon name="ic_search" size={24} />
 * ```
 */
function Icon({ name, size = 24, className, ...props }: IconProps) {
  const SvgComponent = registry.get(name);
  if (!SvgComponent) {
    console.warn(`[even-toolkit] Icon "${name}" not found in registry.`);
    return null;
  }
  return React.createElement(SvgComponent, {
    width: size,
    height: size,
    className,
    ...props,
  });
}

export { Icon };
export type { IconProps, IconComponent };
