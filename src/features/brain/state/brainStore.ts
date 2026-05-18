import { create } from "zustand";
import type { BrainCategory, BrainNode } from "../brain.types";

type BrainState = {
  selectedNode: BrainNode | null;
  hoveredNodeId: string | null;
  filter: BrainCategory | null;
  searchQuery: string;
  isRotationPaused: boolean;
  savedNodeIds: string[];
  selectNode: (node: BrainNode) => void;
  clearSelection: () => void;
  saveSelectedNode: () => void;
  setHoveredNodeId: (id: string | null) => void;
  setFilter: (category: BrainCategory | null) => void;
  setSearchQuery: (query: string) => void;
  setRotationPaused: (paused: boolean) => void;
  matchesFilter: (node: BrainNode) => boolean;
};

export const useBrainStore = create<BrainState>((set, get) => ({
  selectedNode: null,
  hoveredNodeId: null,
  filter: null,
  searchQuery: "",
  isRotationPaused: false,
  savedNodeIds: [],
  selectNode: (node) => set({ selectedNode: node, isRotationPaused: true }),
  clearSelection: () => {
    set({ selectedNode: null });
    window.setTimeout(() => {
      if (!get().selectedNode && !get().hoveredNodeId) {
        set({ isRotationPaused: false });
      }
    }, 2000);
  },
  saveSelectedNode: () =>
    set((state) => {
      if (!state.selectedNode || state.savedNodeIds.includes(state.selectedNode.id)) {
        return state;
      }
      return { savedNodeIds: [...state.savedNodeIds, state.selectedNode.id] };
    }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id, isRotationPaused: Boolean(id) || Boolean(get().selectedNode) }),
  setFilter: (category) => set((state) => ({ filter: state.filter === category ? null : category })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setRotationPaused: (paused) => set({ isRotationPaused: paused || Boolean(get().selectedNode) }),
  matchesFilter: (node) => {
    const { filter, searchQuery, selectedNode } = get();
    if (selectedNode && selectedNode.id !== node.id) {
      return false;
    }
    if (filter && node.category !== filter) {
      return false;
    }
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return `${node.title} ${node.description} ${node.source ?? ""} ${node.author ?? ""}`.toLowerCase().includes(query);
  }
}));
