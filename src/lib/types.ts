export type UserRole = "manager" | "developer";

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
