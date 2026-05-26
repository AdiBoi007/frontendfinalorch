import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProjectCardItem, UserRole } from "../lib/types";

interface WorkspaceState {
  userRole: UserRole;
  profileName: string;
  profileEmail: string;
  projects: ProjectCardItem[];
  onboardingComplete: boolean;
  setUserRole: (role: UserRole) => void;
  setProfile: (name: string, email: string) => void;
  addProject: (project: ProjectCardItem) => void;
  setOnboardingComplete: (value: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      userRole: "manager",
      profileName: "Sarah Chen",
      profileEmail: "sarah@orchestra.app",
      projects: [],
      onboardingComplete: false,
      setUserRole: (role) => set({ userRole: role }),
      setProfile: (name, email) => set({ profileName: name, profileEmail: email }),
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      setOnboardingComplete: (value) => set({ onboardingComplete: value })
    }),
    { name: "orchestra_workspace" }
  )
);
