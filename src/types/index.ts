export interface SubscriptionPlan {
  id: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  price: number;
  currency: string;
  interval: "month" | "year";
  maxOrganizations: number;
  maxMembers: number;
  features: readonly string[];
  stripePriceId: string | null;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "inactive" | "cancelled" | "past_due";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  image?: string;
  createdAt: string;
  metadata?: any;
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MeetingRoom {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  createdBy: string;
  isActive: boolean;
  maxParticipants: number;
  settings: {
    allowScreenShare: boolean;
    allowRecording: boolean;
    requireAuth: boolean;
    muteOnJoin: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  roomId: string;
  organizationId: string;
  createdBy: string;
  scheduledFor: string;
  duration: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  meetingUrl: string | null;
  recordingUrl: string | null;
  agenda: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  role: "host" | "co-host" | "participant";
  status: "invited" | "accepted" | "declined" | "joined" | "left";
  joinedAt: string | null;
  leftAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  createdBy: string;
  status: "active" | "completed" | "archived";
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assignedTo: string | null;
  createdBy: string;
  status: "todo" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedUser?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface Document {
  id: string;
  title: string;
  content: any | string | null;
  organizationId: string;
  projectId: string | null;
  createdBy: string;
  type: "document" | "note" | "agenda" | "minutes";
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
  position?: number;
  slug?: string | null;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface ConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantToken: string;
  participantName: string;
}

export type VideoCodec = 'vp8' | 'vp9' | 'h264' | 'av1';