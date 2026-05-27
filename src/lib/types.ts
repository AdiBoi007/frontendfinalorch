export type UserRole = "manager" | "developer";

export type ChangelogSource = "slack" | "whatsapp" | "gmail" | "github" | "jira" | "manual" | "pdf";

export interface ChangelogEntry {
  id: string;
  projectId: string;
  description: string;
  source: ChangelogSource;
  timestamp: string;
}

export interface DeadlineItem {
  id: string;
  project: string;
  task: string;
  dueDate: string;
  daysLeft: number;
  status: "on-track" | "at-risk" | "critical";
}

export interface RequestItem {
  id: string;
  from: string;
  message: string;
  time: string;
  status: "pending" | "accepted";
  platform: "slack" | "email" | "whatsapp";
}

export interface MeetingItem {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: "standup" | "review" | "client" | "meeting";
  project: string;
}

export interface CalendarDayData {
  meetings: MeetingItem[];
  deadlines: DeadlineItem[];
}

export interface ProjectCardItem {
  id: string;
  name: string;
  clientName: string;
  clientIndustry?: string;
  description: string;
  deadline: string;
  sprint: string;
  progress: number;
  health: "HEALTHY" | "AT RISK" | "Critical";
  color: string;
  lastActivity: string;
  teamInitials: string[];
}

export interface ProjectMember {
  initials: string;
  name: string;
  role: "manager" | "dev" | "client";
}

export interface ProjectSubscription {
  id: string;
  name: string;
  category: string;
  cost: number;
  billing: "monthly" | "per-transaction";
  status: "active";
}

export interface ProjectRecentChange {
  id: string;
  title: string;
  status: "accepted" | "pending";
  timeAgo: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  clientName: string;
  lastUpdated: string;
  health: "HEALTHY" | "AT RISK" | "Critical";
  progress: number;
  description: string;
  deadline: string;
  sprint: string;
  budget: number;
  spent: number;
  team: ProjectMember[];
  openRoles: number;
  subscriptions: ProjectSubscription[];
  recentChanges: ProjectRecentChange[];
  brainStatus: "ACTIVE";
  docsCount: number;
  docsReady: number;
}

export interface Doc {
  id: string;
  name: string;
  type: "prd" | "srs" | "spec" | "transcript" | "audio" | "image" | "change" | "decision" | "context";
  size: string;
  pages: number;
  status: "ready" | "processing" | "failed";
  uploadedBy: string;
  uploadedAt: string;
  excerpt: string;
}

export type DocFilter = "all" | "prd" | "srs" | "spec" | "transcript" | "audio" | "image" | "change" | "decision" | "context";

export interface DocSection {
  id: string;
  anchorId: string;
  type: "heading" | "paragraph" | "list" | "code";
  level?: number;
  content: string;
  hasChange: boolean;
  changeId?: string;
  citationIds?: string[];
}

export interface DocViewerPayload {
  id: string;
  title: string;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  totalPages: number;
  sections: DocSection[];
}

export interface AnchorProvenance {
  anchorId: string;
  sourceDoc: string;
  excerpt: string;
  linkedMessages: {
    id: string;
    from: string;
    platform: "slack" | "email" | "whatsapp";
    content: string;
    sentAt: string;
  }[];
  acceptedChanges: {
    id: string;
    summary: string;
    acceptedAt: string;
    acceptedBy: string;
  }[];
}

export interface RoleOption {
  key: "manager" | "dev" | "client";
  label: "Manager" | "Dev" | "Client";
  icon: "briefcase" | "code" | "eye";
}

export interface SocratesSuggestionGroups {
  dashboard: string[];
  project: string[];
}

export interface SocratesReplyGroups {
  dashboard: string;
  project: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export type IntegrationCategory =
  | "editor"
  | "comms"
  | "calendar"
  | "payments"
  | "infrastructure"
  | "database"
  | "hosting"
  | "monitoring"
  | "notifications";

export interface IntegrationStatus {
  id: string;
  name: string;
  category: IntegrationCategory;
  connected: boolean;
  accountConnected?: boolean;
  lastSyncedAt?: string;
}
