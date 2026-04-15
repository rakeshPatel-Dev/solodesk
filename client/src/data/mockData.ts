import { Users, FolderKanban, BadgeDollarSign, ClipboardList } from 'lucide-react';

export const dashboardStats = [
  { title: 'Total Revenue', value: '$142,850', icon: BadgeDollarSign, subTitle: '12% from last month', trend: '12%', trendDirection: 'up' as const },
  { title: 'Paid Invoices', value: '32', icon: ClipboardList, subTitle: 'All clear this week', trend: '80%', trendDirection: 'neutral' as const },
  { title: 'Outstanding', value: '$8,400', icon: FolderKanban, subTitle: '3 overdue notices sent', trend: '2.5%', trendDirection: 'down' as const },
  { title: 'Avg. Payout Time', value: '4.2 Days', icon: Users, subTitle: 'Consistent performance', trend: '3.9%', trendDirection: 'up' as const },
];

export const mockInvoices = [
  { id: '#INV-2024-001', clientIdentifier: 'AL', clientName: 'Aether Labs', project: 'Brand Identity Refresh', amount: '$4,500.00', date: 'Oct 24, 2023', status: 'Paid' },
  { id: '#INV-2024-002', clientIdentifier: 'NH', clientName: 'Neo-Humanity', project: 'UI/UX Audit', amount: '$1,200.00', date: 'Nov 12, 2023', status: 'Pending' },
  { id: '#INV-2023-098', clientIdentifier: 'ST', clientName: 'Studio T', project: 'Web Development', amount: '$7,200.00', date: 'Sep 15, 2023', status: 'Overdue' },
  { id: '#INV-2024-004', clientIdentifier: 'KM', clientName: 'Kyber Media', project: 'Content Strategy', amount: '$2,800.00', date: 'Nov 28, 2023', status: 'Paid' },
];

// export const mockClients = [
//   { id: '1', name: 'Aether Labs', initial: 'AL', email: 'hello@aetherlabs.com', status: 'Active', spent: '$12,500' },
//   { id: '2', name: 'Neo-Humanity', initial: 'NH', email: 'contact@neohumanity.org', status: 'Active', spent: '$4,200' },
//   { id: '3', name: 'Studio T', initial: 'ST', email: 'admin@studiot.design', status: 'Inactive', spent: '$25,000' },
// ];

export const mockProjects = [
  {
    id: 'PRJ-001',
    name: 'Brand Identity Refresh',
    description: 'Rework complete identity system and social templates.',
    clientId: { _id: 'CLT-001', name: 'Acme Corporation' },
    type: 'Branding',
    budget: 12500,
    status: 'In Progress',
    startDate: '2026-03-10',
    deadline: '2026-05-20',
  },
  {
    id: 'PRJ-002',
    name: 'UX Audit Sprint',
    description: 'Audit current experience and deliver prioritized UX roadmap.',
    clientId: { _id: 'CLT-002', name: 'Stellar Studios' },
    type: 'Consulting',
    budget: 8200,
    status: 'Lead',
    startDate: '2026-04-18',
    deadline: '2026-06-02',
  },
  {
    id: 'PRJ-003',
    name: 'Marketing Website Build',
    description: 'Design and ship a conversion-focused marketing website.',
    clientId: { _id: 'CLT-003', name: 'Nexus Industries' },
    type: 'Web Development',
    budget: 23100,
    status: 'Completed',
    startDate: '2026-01-12',
    deadline: '2026-03-29',
  },
];

export const mockProjectPaymentUpdates: Record<
  string,
  { amount: number; date: string }[]
> = {
  'PRJ-001': [
    { amount: 10000, date: '2026-04-10' },
    { amount: 5000, date: '2026-04-15' },
  ],
  'PRJ-002': [{ amount: 2000, date: '2026-04-20' }],
  'PRJ-003': [
    { amount: 12000, date: '2026-02-05' },
    { amount: 11100, date: '2026-03-21' },
  ],
}

export const mockTasks = [
  { id: '1', title: 'Design home page wireframes', project: 'Brand Identity Refresh', priority: 'High', status: 'In Progress' },
  { id: '2', title: 'User testing report', project: 'UI/UX Audit', priority: 'Medium', status: 'Done' },
  { id: '3', title: 'Fix navigation bug', project: 'Web Development', priority: 'Low', status: 'Done' },
];

// data/mockData.ts
export const mockClients = [
  {
    id: 'CLT-001',
    name: 'Acme Corporation',
    initials: 'AC',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    status: 'Active',
    spent: '$12,450',
  },
  {
    id: 'CLT-002',
    name: 'Stellar Studios',
    initials: 'SS',
    email: 'hello@stellar.com',
    phone: '+1 (555) 234-5678',
    status: 'Active',
    spent: '$8,230',
  },
  {
    id: 'CLT-003',
    name: 'Nexus Industries',
    initials: 'NI',
    email: 'info@nexus.com',
    phone: '+1 (555) 345-6789',
    status: 'Inactive',
    spent: '$23,100',
  },
  {
    id: 'CLT-004',
    name: 'Bluewave Media',
    initials: 'BM',
    email: 'studio@bluewave.com',
    phone: '+1 (555) 456-7890',
    status: 'Active',
    spent: '$5,670',
  },
  {
    id: 'CLT-005',
    name: 'Vertex Solutions',
    initials: 'VS',
    email: 'team@vertex.com',
    phone: '+1 (555) 567-8901',
    status: 'Active',
    spent: '$15,890',
  },
]
