import { mockSupportedConnectors } from "./mockData";

const storageKey = (projectId: string) => `orchestra_connected_${projectId}`;

export function getStoredConnectedIntegrationIds(projectId: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function storeConnectedIntegrationId(projectId: string, integrationId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const ids = new Set(getStoredConnectedIntegrationIds(projectId));
  ids.add(integrationId);
  window.localStorage.setItem(storageKey(projectId), JSON.stringify([...ids]));
}

export function storeConnectedIntegrationNames(projectId: string, names: string[]) {
  for (const name of names) {
    const connector = mockSupportedConnectors.find((item) => item.name === name);
    if (connector) {
      storeConnectedIntegrationId(projectId, connector.id);
    }
  }
}
