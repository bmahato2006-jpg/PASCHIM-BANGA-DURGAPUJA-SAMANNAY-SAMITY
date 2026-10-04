export type UserRole = 'voter' | 'organizer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  clubId?: string; // If role is organizer, associated pandal/club id
}

export type VoteCategory = 'idol' | 'theme' | 'lighting' | 'eco';

export interface VoteCategoryInfo {
  id: VoteCategory;
  title: string;
  bengaliTitle: string;
  description: string;
  iconName: string;
  accentColor: string;
}

export interface PandalVotes {
  idol: number;
  theme: number;
  lighting: number;
  eco: number;
}

export interface PandalMedia {
  id: string;
  url: string;
  caption: string;
  type: 'photo' | 'video';
  tag: 'Idol' | 'Theme' | 'Lighting' | 'Gate' | 'Crowd' | 'Eco';
  isFeatured?: boolean;
}

export interface Pandal {
  id: string;
  name: string;
  clubName: string;
  location: string;
  ward: string;
  nearLandmark: string;
  budget: string;
  budgetNumber: number; // In Lakhs INR for analytics
  theme: string;
  themeDescription: string;
  presidentName: string;
  secretaryName: string;
  contactNumber: string;
  establishedYear: number;
  coverImage: string;
  logoUrl?: string; // Committee Logo
  gallery: PandalMedia[];
  votes: PandalVotes;
  totalVotes: number;
  rank?: number;
  visitsToday: number;
  tags: string[];
  isEcoFriendly: boolean;
  qrCodeUrl?: string;
  organizerEmail?: string;
}

export interface VoteRecord {
  pandalId: string;
  userId: string;
  category: VoteCategory;
  timestamp: number;
}

export interface SupportTicket {
  id: string;
  userName: string;
  userEmail: string;
  contactNumber: string;
  issueCategory: 'Voting Bug' | 'Pandal Details Incorrect' | 'Emergency / Crowd' | 'Lost & Found' | 'Other';
  pandalName?: string;
  message: string;
  status: 'Open' | 'Resolved';
  createdAt: string;
}
