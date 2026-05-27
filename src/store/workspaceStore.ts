import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "../lib/types";

interface WorkspaceState {
  userRole: UserRole;
  profileName: string;
  profileEmail: string;
  workspaceName: string;
  onboardingComplete: boolean;
  setUserRole: (role: UserRole) => void;
  setProfile: (name: string, email: string) => void;
  setWorkspaceName: (name: string) => void;
  setOnboardingComplete: (value: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      userRole: "manager",
      profileName: "Sarah Chen",
      profileEmail: "sarah@orchestra.app",
      workspaceName: "",
      onboardingComplete: false,
      setUserRole: (role) => set({ userRole: role }),
      setProfile: (name, email) => set({ profileName: name, profileEmail: email }),
      setWorkspaceName: (name) => set({ workspaceName: name }),
      setOnboardingComplete: (value) => set({ onboardingComplete: value })
    }),
    { name: "orchestra_workspace" }
  )
);
