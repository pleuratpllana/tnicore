export type DestinationId = 'onboarding' | 'customer' | 'client' | 'technician' | 'projects' | 'bicsi' | 'email' | 'payment';

export interface Destination {
  id: DestinationId;
  label: string;
  eyebrow: string;
  detail: string;
  href: string;
  group: string;
  routeNumber: string;
  angle: number;
  gateSymbol: number;
}

export const onboardingHub: Destination = {
  id: 'onboarding', label: 'Onboarding', eyebrow: 'PEOPLE / 01', detail: 'Choose customer, client or technician onboarding.',
  href: '/destination/onboarding', group: 'onboarding', routeNumber: '01', angle: -90, gateSymbol: 3,
};

// Replace the local paths with approved production destinations when they are supplied.
export const destinations: Destination[] = [
  { id: 'customer', label: 'Customer', eyebrow: 'ONBOARDING / 01', detail: 'Start a customer onboarding request.', href: '/destination/customer', group: 'onboarding', routeNumber: '01', angle: -135, gateSymbol: 8 },
  { id: 'client', label: 'Client', eyebrow: 'ONBOARDING / 02', detail: 'Start a client onboarding request.', href: '/destination/client', group: 'onboarding', routeNumber: '02', angle: -90, gateSymbol: 15 },
  { id: 'technician', label: 'Technician', eyebrow: 'ONBOARDING / 03', detail: 'Start a technician onboarding request.', href: '/destination/technician', group: 'onboarding', routeNumber: '03', angle: -45, gateSymbol: 22 },
  { id: 'projects', label: 'Projects', eyebrow: 'WORKSPACE / 02', detail: 'Project workspace · SharePoint access required.', href: '/destination/projects', group: 'workspace', routeNumber: '02', angle: -18, gateSymbol: 6 },
  { id: 'bicsi', label: 'BICSI', eyebrow: 'LEARNING / 03', detail: 'Training and certification levels.', href: '/destination/bicsi', group: 'learning', routeNumber: '03', angle: 54, gateSymbol: 17 },
  { id: 'email', label: 'Webmail', eyebrow: 'COMMUNICATIONS / 04', detail: 'TNICore email · Roundcube access.', href: '/destination/email', group: 'communications', routeNumber: '04', angle: 126, gateSymbol: 28 },
  { id: 'payment', label: 'Payment Portal', eyebrow: 'ACCOUNTS / 05', detail: 'Open the payment portal.', href: '/destination/payment', group: 'accounts', routeNumber: '05', angle: 198, gateSymbol: 35 },
];

export const portalNodes = [onboardingHub, ...destinations.filter((item) => item.group !== 'onboarding')];
