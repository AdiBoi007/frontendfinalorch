// TODO: replace with real fetch when backend ready
// BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"
// AUTH = Authorization: Bearer localStorage.getItem("orchestra_token")

import * as mock from "./mockData";
import { getStoredConnectedIntegrationIds } from "./integrationStorage";
import { useWorkspaceStore } from "../store/workspaceStore";
import type {
  AnchorProvenance,
  ChangelogEntry,
  ChatMessage,
  Doc,
  DocViewerPayload,
  FlowGraph,
  IntegrationStatus,
  LiveDocPayload,
  ProjectDetail,
  ProjectMember,
  RoleOption,
  UserRole
} from "./types";

export const getProjects = async () => mock.mockProjects;
export const getDeadlines = async () => mock.mockDeadlines;
export const getRequests = async () => mock.mockRequests;
export const getMeetings = async () => mock.mockMeetings;
// TODO: getMeetings -> Google Calendar OAuth
export const getCalendarEvents = async () => mock.mockCalendarEvents;
// TODO: swap mockCalendarEvents with Google Calendar API
export const getLoginRoles = async (): Promise<RoleOption[]> => mock.mockRoles;

// TODO: GET /v1/users/me
export const getUserRole = async (): Promise<UserRole> => useWorkspaceStore.getState().userRole;

// TODO: PATCH /v1/users/me
export const setUserRole = async (role: UserRole): Promise<void> => {
  useWorkspaceStore.getState().setUserRole(role);
};

// TODO: POST /v1/users/me/onboarding-complete
export const markOnboardingComplete = async (): Promise<void> => {
  useWorkspaceStore.getState().setOnboardingComplete(true);
};

// TODO: GET /v1/projects/:projectId/changelog
export const getChangelog = async (projectId: string): Promise<ChangelogEntry[]> => {
  const entries = mock.mockChangelog.filter((entry) => entry.projectId === projectId);
  if (entries.length > 0) {
    return entries;
  }

  const storedIds = getStoredConnectedIntegrationIds(projectId);
  if (storedIds.length > 0) {
    return mock.mockChangelog.filter((entry) => entry.projectId === "1");
  }

  return [];
};
export const getSocratesSuggestions = async (page: "dashboard" | "project") => mock.mockSocratesSuggestions[page];
export const getSocratesReply = async (page: "dashboard" | "project") => mock.mockSocratesReplies[page];
export const getSocratesMessages = async (): Promise<ChatMessage[]> => mock.mockSocratesMessages;

// TODO: GET /v1/projects/:projectId
export const getProjectDetail = async (projectId: string): Promise<ProjectDetail> => {
  void projectId;
  return mock.mockProjectDetail;
};

// TODO: GET /v1/projects/:projectId/members
export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  void projectId;
  return mock.mockProjectDetail.team;
};

// TODO: replace with GET /v1/projects/:projectId/documents
export const getDocs = async (projectId: string): Promise<Doc[]> => {
  void projectId;
  return mock.mockDocs;
};

// TODO: replace with POST /v1/projects/:projectId/documents/upload
export const uploadDoc = async (projectId: string, file: File, type: string): Promise<Doc> => {
  void projectId;

  return {
    id: Date.now().toString(),
    name: file.name,
    type: type as Doc["type"],
    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    pages: 1,
    status: "processing",
    uploadedBy: "SC",
    uploadedAt: "Just now",
    excerpt: "Processing document..."
  };
};

// TODO: replace mock with real fetch when backend ready
// GET /v1/projects/:projectId/brain/graph/current
// Returns: { nodes: FlowNode[], edges: FlowEdge[] }
export const getFlowGraph = async (projectId: string): Promise<FlowGraph> => {
  void projectId;
  return mock.mockFlowGraph;
};

// TODO: GET /v1/projects/:projectId/documents/:documentId/view
export const getDocViewer = async (projectId: string, docId: string): Promise<DocViewerPayload> => {
  void projectId;
  void docId;
  return mock.mockDocViewer;
};

// TODO: GET /v1/projects/:projectId/documents/:documentId/anchors/:anchorId/provenance
export const getAnchorProvenance = async (
  projectId: string,
  docId: string,
  anchorId: string
): Promise<AnchorProvenance | null> => {
  void projectId;
  void docId;
  return mock.mockProvenance[anchorId] ?? null;
};

// TODO: GET /v1/projects/:projectId/brain/current
// Returns compiled living doc built from brain + accepted changes
export const getLiveDoc = async (projectId: string): Promise<LiveDocPayload> => {
  void projectId;
  return mock.mockLiveDoc;
};

// TODO: PATCH /v1/projects/:projectId/brain/current
// Saves edits to live doc section
export const saveLiveDocSection = async (projectId: string, sectionId: string, content: string) => {
  void projectId;
  void sectionId;
  void content;
  return { success: true };
};

// TODO: GET /v1/projects/:projectId/integrations
// Returns connection status for every external service wired to this project.
// connected: true  → OAuth / API key verified by backend
// connected: false → not yet authorised; frontend should prompt user to connect
export const getIntegrationStatuses = async (projectId: string): Promise<IntegrationStatus[]> => {
  const storedConnected = new Set(getStoredConnectedIntegrationIds(projectId));
  const projectStatuses = mock.mockIntegrationStatuses[projectId];
  const hasProjectMock = projectStatuses !== undefined;

  return mock.mockSupportedConnectors.map((connector) => {
    const existing = projectStatuses?.find((status) => status.id === connector.id);
    const base: IntegrationStatus = existing ?? {
      ...connector,
      connected: false,
      accountConnected: false
    };

    if (storedConnected.has(connector.id)) {
      return {
        ...base,
        connected: true,
        accountConnected: true,
        lastSyncedAt: base.lastSyncedAt ?? new Date().toISOString()
      };
    }

    if (hasProjectMock && existing?.connected) {
      return existing;
    }

    return {
      ...base,
      connected: false,
      accountConnected: false
    };
  });
};

// TODO: POST /v1/projects/:projectId/brain/ask
// Body: { nodeTitle: string; nodeContent: string; messages: { role: string; content: string }[] }
// Response: { reply: string }
export const askSocrates = async (
  projectId: string,
  nodeTitle: string,
  nodeContent: string,
  messages: { role: string; content: string }[]
): Promise<string> => {
  void projectId;
  void nodeTitle;
  void nodeContent;
  void messages;
  return "Socrates is not yet connected. Once the backend proxy is wired up, I will answer questions about this document using the full project context.";
};
