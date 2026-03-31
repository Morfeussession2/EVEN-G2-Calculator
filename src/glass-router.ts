import { createScreenMapper } from 'even-toolkit/glass-router';

/**
 * Maps the current web path to a glasses screen name.
 * This is used by the EvenHubBridge to determine what to render on the G2.
 */
export const deriveScreen = createScreenMapper([
  { pattern: '/', screen: 'calculator' },
  { pattern: '/settings', screen: 'settings' },
], 'calculator');
