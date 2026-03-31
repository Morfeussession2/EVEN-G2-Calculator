# Even Toolkit — Icon System

## Adding Icons

1. **Export SVGs from Figma**: Select the icon layer → Export as SVG → optimize with SVGO if desired.

2. **Create a React component** (or use your bundler's SVG import):
   ```tsx
   // icons/arrow-right.tsx
   export default (props: React.SVGProps<SVGSVGElement>) => (
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
       <path d="M5 12h14M12 5l7 7-7 7" />
     </svg>
   );
   ```

3. **Register the icon** in your app's entry point:
   ```tsx
   import { registerIcon } from 'even-toolkit/web/icons';
   import ArrowRight from './icons/arrow-right';
   registerIcon('arrow-right', ArrowRight);
   ```

4. **Use it anywhere**:
   ```tsx
   import { Icon } from 'even-toolkit/web/icons';
   <Icon name="arrow-right" size={20} className="text-accent" />
   ```

## Icon Categories (from Design Guidelines)

- **Menu Bar** — app navigation icons
- **Feature & Function** — action icons (add, edit, delete, share, etc.)
- **Guide System** — onboarding / tutorial icons
- **Edit & Settings** — configuration icons
- **Status** — connection, battery, sync indicators
- **Navigate** — arrows, chevrons, back/forward
- **Health** — heart rate, steps, workout icons
