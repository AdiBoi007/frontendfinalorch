// TODO: replace with real fetch when backend ready
// BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"
// AUTH = Authorization: Bearer localStorage.getItem("orchestra_token")

import * as mock from "./mockData";
import { getStoredConnectedIntegrationIds } from "./integrationStorage";
import { useWorkspaceStore } from "../store/workspaceStore";
import type { AnchorProvenance, Doc, DocViewerPayload, IntegrationStatus, RoleOption, UserRole } from "./types";

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

// TODO: GET /v1/projects/:projectId/integrations
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
