import type {
  AnchorProvenance,
  CalendarDayData,
  ChangelogEntry,
  ChatMessage,
  DeadlineItem,
  Doc,
  DocViewerPayload,
  IntegrationStatus,
  MeetingItem,
  ProjectCardItem,
  ProjectDetail,
  RequestItem,
  RoleOption,
  SocratesReplyGroups,
  SocratesSuggestionGroups,
  UserRole
} from "./types";

export const mockUserRole: UserRole = "manager";
export const mockOnboardingComplete = false;

export const mockProjects: ProjectCardItem[] = [
  {
    id: "1",
    name: "BloomFast MVP",
    clientName: "BloomFast",
    description: "On-demand flower delivery marketplace with buyer ordering, florist dashboard, and driver assignment.",
    deadline: "Jun 2026",
    sprint: "2 of 8",
    progress: 34,
    health: "HEALTHY",
    color: "rgba(45,74,62,0.10)",
    lastActivity: "2h ago",
    teamInitials: ["SC", "MT", "PK", "JW"]
  },
  {
    id: "2",
    name: "Elara Games",
    clientName: "Elara Studios",
    description: "Mobile-first game platform with live events, player progression loops, and publisher integrations.",
    deadline: "Aug 2026",
    sprint: "4 of 6",
    progress: 38,
    health: "AT RISK",
    color: "rgba(120,113,108,0.10)",
    lastActivity: "Yesterday",
    teamInitials: ["SC", "AP", "LF"]
  },
  {
    id: "3",
    name: "API Gateway",
    clientName: "Internal",
    description: "Unified API gateway with JWT auth, rate limiting, webhook retries, and enterprise integrations.",
    deadline: "May 2026",
    sprint: "6 of 8",
    progress: 79,
    health: "Critical",
    color: "rgba(194,136,64,0.12)",
    lastActivity: "4d ago",
    teamInitials: ["MT", "PK"]
  }
];

export const mockChangelog: ChangelogEntry[] = [
  {
    id: "cl-1",
    projectId: "1",
    description: "Manager approval required before driver assignment is confirmed.",
    source: "whatsapp",
    timestamp: "Apr 15, 2026 · 2:14 PM"
  },
  {
    id: "cl-1b",
    projectId: "1",
    description: "Florist confirmed same-day cutoff moved to 2:00 PM local.",
    source: "whatsapp",
    timestamp: "Apr 14, 2026 · 5:40 PM"
  },
  {
    id: "cl-2",
    projectId: "1",
    description: "Pro subscription deferred to v2 after client kickoff call.",
    source: "slack",
    timestamp: "Apr 14, 2026 · 11:02 AM"
  },
  {
    id: "cl-2b",
    projectId: "1",
    description: "Engineering agreed to ship driver retry queue before launch.",
    source: "slack",
    timestamp: "Apr 13, 2026 · 9:18 AM"
  },
  {
    id: "cl-2c",
    projectId: "1",
    description: "Design review signed off on florist dashboard empty states.",
    source: "slack",
    timestamp: "Apr 12, 2026 · 4:55 PM"
  },
  {
    id: "cl-3",
    projectId: "1",
    description: "SRS v2 uploaded and indexed as primary PDF source.",
    source: "pdf",
    timestamp: "Apr 13, 2026 · 4:45 PM"
  },
  {
    id: "cl-4",
    projectId: "1",
    description: "Stripe payout schedule updated to weekly batching.",
    source: "manual",
    timestamp: "Apr 12, 2026 · 9:30 AM"
  },
  {
    id: "cl-5",
    projectId: "1",
    description: "Client asked for promo code support in checkout flow.",
    source: "gmail",
    timestamp: "Apr 11, 2026 · 6:18 PM"
  },
  {
    id: "cl-5b",
    projectId: "1",
    description: "Legal approved updated buyer refund policy language.",
    source: "gmail",
    timestamp: "Apr 10, 2026 · 2:05 PM"
  },
  {
    id: "cl-5c",
    projectId: "1",
    description: "Stakeholder thread closed: OAuth removed from v1 scope.",
    source: "gmail",
    timestamp: "Apr 9, 2026 · 11:30 AM"
  },
  {
    id: "cl-6",
    projectId: "1",
    description: "PR #142 merged: driver assignment webhook and retry policy.",
    source: "github",
    timestamp: "Apr 10, 2026 · 3:22 PM"
  },
  {
    id: "cl-6b",
    projectId: "1",
    description: "PR #138 opened: Stripe Connect payout reconciliation job.",
    source: "github",
    timestamp: "Apr 8, 2026 · 1:48 PM"
  },
  {
    id: "cl-7",
    projectId: "1",
    description: "Sprint 14 scope locked — custom reporting deferred to v2.",
    source: "jira",
    timestamp: "Apr 9, 2026 · 10:15 AM"
  },
  {
    id: "cl-7b",
    projectId: "1",
    description: "Ticket BF-214 accepted: manager approval gate on driver assign.",
    source: "jira",
    timestamp: "Apr 7, 2026 · 3:00 PM"
  }
];

export const mockProjectDetail: ProjectDetail = {
  id: "1",
  name: "BloomFast MVP",
  clientName: "BloomFast",
  lastUpdated: "Apr 18, 2026 · 3:42 PM",
  health: "HEALTHY",
  progress: 34,
  description: "On-demand flower delivery marketplace. Buyer ordering, florist dashboard, driver assignment.",
  deadline: "Jun 2026",
  sprint: "2 of 8",
  budget: 85000,
  spent: 28900,
  team: [
    { initials: "SC", name: "Sarah Chen", role: "manager" },
    { initials: "MT", name: "Marcus T", role: "dev" },
    { initials: "PK", name: "Priya K", role: "dev" },
    { initials: "JW", name: "James W", role: "dev" },
    { initials: "AP", name: "Alex P", role: "dev" },
    { initials: "LF", name: "Lisa F", role: "client" }
  ],
  openRoles: 2,
  subscriptions: [
    { id: "s1", name: "AWS (EC2 + RDS)", category: "Infrastructure", cost: 420, billing: "monthly", status: "active" },
    { id: "s2", name: "Supabase Pro", category: "Database", cost: 25, billing: "monthly", status: "active" },
    { id: "s3", name: "Stripe", category: "Payments", cost: 0, billing: "per-transaction", status: "active" },
    { id: "s4", name: "Firebase", category: "Notifications", cost: 15, billing: "monthly", status: "active" },
    { id: "s5", name: "Vercel Pro", category: "Hosting", cost: 20, billing: "monthly", status: "active" },
    { id: "s6", name: "Sentry", category: "Monitoring", cost: 26, billing: "monthly", status: "active" }
  ],
  recentChanges: [
    { id: "rc1", title: "Manager approval required for driver assignment", status: "accepted", timeAgo: "2d ago" },
    { id: "rc2", title: "Pro subscription deferred to v2", status: "accepted", timeAgo: "3d ago" },
    { id: "rc3", title: "OAuth removed from v1 scope", status: "accepted", timeAgo: "5d ago" },
    { id: "rc4", title: "Promo code system requested", status: "pending", timeAgo: "2h ago" }
  ],
  brainStatus: "ACTIVE",
  docsCount: 8,
  docsReady: 6
};

export const mockDocs: Doc[] = [
  {
    id: "1",
    name: "BloomFast PRD v2",
    type: "prd",
    size: "2.4 MB",
    pages: 24,
    status: "ready",
    uploadedBy: "SC",
    uploadedAt: "Apr 18, 2026",
    excerpt:
      "BloomFast is an on-demand flower delivery marketplace connecting buyers to local florists. Client wants an MVP with buyer-facing ordering, florist-facing order management, and driver assignment."
  },
  {
    id: "2",
    name: "SRS Document",
    type: "srs",
    size: "1.8 MB",
    pages: 18,
    status: "ready",
    uploadedBy: "MT",
    uploadedAt: "Apr 17, 2026",
    excerpt:
      "System requirements for BloomFast MVP. Covers authentication, order flow, payment integration, and driver assignment module specifications."
  },
  {
    id: "3",
    name: "Tech Architecture Spec",
    type: "spec",
    size: "980 KB",
    pages: 12,
    status: "ready",
    uploadedBy: "SC",
    uploadedAt: "Apr 16, 2026",
    excerpt:
      "Working end-to-end order flow for buyers and florists. No Pro subscription in MVP. Manager approval required before driver assignment."
  },
  {
    id: "4",
    name: "Client Kickoff Call",
    type: "transcript",
    size: "340 KB",
    pages: 8,
    status: "ready",
    uploadedBy: "SC",
    uploadedAt: "Apr 15, 2026",
    excerpt:
      "Hey Sarah - one thing we forgot to mention. We need manager approval before any driver gets assigned to an order. The florist manager has to sign off first."
  },
  {
    id: "5",
    name: "Design Mockups v3",
    type: "image",
    size: "14.2 MB",
    pages: 1,
    status: "ready",
    uploadedBy: "JW",
    uploadedAt: "Apr 14, 2026",
    excerpt: "Design mockups v3 · buyer ordering flow, florist dashboard, and driver assignment screens."
  },
  {
    id: "6",
    name: "Sprint 2 Recording",
    type: "audio",
    size: "48 MB",
    pages: 1,
    status: "processing",
    uploadedBy: "MT",
    uploadedAt: "Apr 21, 2026",
    excerpt: "Sprint 2 standup recording. Processing in progress."
  },
  {
    id: "7",
    name: "Payment Flow Diagram",
    type: "image",
    size: "3.1 MB",
    pages: 1,
    status: "ready",
    uploadedBy: "PK",
    uploadedAt: "Apr 13, 2026",
    excerpt:
      "Can we add a Pro subscription for florists with better revenue share? Like 85% instead of 70%? I think it really helps retention."
  },
  {
    id: "8",
    name: "Stakeholder Email Thread",
    type: "transcript",
    size: "120 KB",
    pages: 3,
    status: "ready",
    uploadedBy: "SC",
    uploadedAt: "Apr 12, 2026",
    excerpt: "Stakeholder alignment on scope. OAuth removed from v1. Payment flow confirmed with Stripe."
  }
];

export const mockDocViewer: DocViewerPayload = {
  id: "1",
  title: "BloomFast PRD v2",
  version: "v2.1",
  uploadedBy: "Sarah Chen",
  uploadedAt: "Apr 18, 2026",
  totalPages: 24,
  sections: [
    {
      id: "s1",
      anchorId: "overview",
      type: "heading",
      level: 1,
      content: "BloomFast · Product Requirements Document",
      hasChange: false
    },
    {
      id: "s2",
      anchorId: "summary",
      type: "paragraph",
      content:
        "BloomFast is an on-demand flower delivery marketplace connecting buyers to local florists. The platform enables buyer-facing ordering, florist-facing order management, and driver assignment with real-time tracking.",
      hasChange: false
    },
    {
      id: "s3",
      anchorId: "scope",
      type: "heading",
      level: 2,
      content: "1. Product Scope",
      hasChange: false
    },
    {
      id: "s4",
      anchorId: "scope-detail",
      type: "paragraph",
      content:
        "The MVP covers three primary user flows: buyer ordering, florist dashboard, and driver assignment. Payment processing via Stripe. No Pro subscription in v1.",
      hasChange: true,
      changeId: "c1",
      citationIds: ["cite-1"]
    },
    {
      id: "s5",
      anchorId: "auth",
      type: "heading",
      level: 2,
      content: "2. Authentication",
      hasChange: false
    },
    {
      id: "s6",
      anchorId: "auth-detail",
      type: "paragraph",
      content: "OAuth 2.0 with Google SSO for buyers. Email/password for florists and drivers. JWT tokens with 24hr expiry.",
      hasChange: true,
      changeId: "c2",
      citationIds: ["cite-2"]
    },
    {
      id: "s7",
      anchorId: "driver",
      type: "heading",
      level: 2,
      content: "3. Driver Assignment",
      hasChange: false
    },
    {
      id: "s8",
      anchorId: "driver-detail",
      type: "paragraph",
      content:
        "Drivers are assigned automatically based on proximity and availability. Manager approval required before assignment is confirmed. Florist manager must sign off on each order.",
      hasChange: true,
      changeId: "c3",
      citationIds: ["cite-3"]
    },
    {
      id: "s9",
      anchorId: "payments",
      type: "heading",
      level: 2,
      content: "4. Payment Integration",
      hasChange: false
    },
    {
      id: "s10",
      anchorId: "payments-detail",
      type: "paragraph",
      content: "Stripe Connect for buyer payments and florist payouts. Revenue share: 70% florist, 30% platform. Payout batching weekly.",
      hasChange: false
    },
    {
      id: "s11",
      anchorId: "notifications",
      type: "heading",
      level: 2,
      content: "5. Notifications",
      hasChange: false
    },
    {
      id: "s12",
      anchorId: "notifications-detail",
      type: "paragraph",
      content:
        "SMS notifications for order status updates. Email confirmations for buyers. Push notifications for florists and drivers via Firebase.",
      hasChange: false
    }
  ]
};

export const mockProvenance: Record<string, AnchorProvenance> = {
  "scope-detail": {
    anchorId: "scope-detail",
    sourceDoc: "BloomFast PRD v2 · Section 1",
    excerpt: "No Pro subscription in v1.",
    linkedMessages: [
      {
        id: "m1",
        from: "Jack (BloomFast)",
        platform: "slack",
        content: "Confirmed · no Pro subscription for MVP. Keep it simple for launch.",
        sentAt: "Apr 14, 2026"
      }
    ],
    acceptedChanges: [
      {
        id: "c1",
        summary: "Pro subscription deferred to v2",
        acceptedAt: "Apr 15, 2026",
        acceptedBy: "Sarah Chen"
      }
    ]
  },
  "auth-detail": {
    anchorId: "auth-detail",
    sourceDoc: "BloomFast PRD v2 · Section 2",
    excerpt: "OAuth removed from v1 scope.",
    linkedMessages: [
      {
        id: "m2",
        from: "Mike (API Gateway)",
        platform: "email",
        content: "Confirmed: remove OAuth from v1 scope. Email/password is sufficient for launch.",
        sentAt: "Apr 16, 2026"
      }
    ],
    acceptedChanges: [
      {
        id: "c2",
        summary: "OAuth removed from MVP, email/password only",
        acceptedAt: "Apr 16, 2026",
        acceptedBy: "Sarah Chen"
      }
    ]
  },
  "driver-detail": {
    anchorId: "driver-detail",
    sourceDoc: "Client Kickoff Transcript",
    excerpt: "Manager approval before driver assignment.",
    linkedMessages: [
      {
        id: "m3",
        from: "Jack (BloomFast)",
        platform: "whatsapp",
        content:
          "Hey Sarah - one thing we forgot to mention. We need manager approval before any driver gets assigned. The florist manager has to sign off first.",
        sentAt: "Apr 14, 2026"
      }
    ],
    acceptedChanges: [
      {
        id: "c3",
        summary: "Manager approval required before driver assignment",
        acceptedAt: "Apr 15, 2026",
        acceptedBy: "Sarah Chen"
      }
    ]
  }
};

export const mockDeadlines: DeadlineItem[] = [
  { id: "1", project: "BloomFast MVP", task: "Payment integration", dueDate: "Apr 24", daysLeft: 3, status: "on-track" },
  { id: "2", project: "API Gateway", task: "Auth module handoff", dueDate: "Apr 26", daysLeft: 5, status: "at-risk" },
  { id: "3", project: "Elara Games", task: "Dashboard v2 delivery", dueDate: "May 2", daysLeft: 11, status: "on-track" }
];

export const mockRequests: RequestItem[] = [
  {
    id: "1",
    from: "Jack · BloomFast",
    message: "Can we add a promo code system to checkout?",
    time: "2h ago",
    status: "pending",
    platform: "slack"
  },
  {
    id: "2",
    from: "Elena · Elara Games",
    message: "Need dark mode support across dashboard",
    time: "5h ago",
    status: "pending",
    platform: "email"
  },
  {
    id: "3",
    from: "Mike · API Gateway",
    message: "Confirmed: remove OAuth from v1 scope",
    time: "1d ago",
    status: "accepted",
    platform: "slack"
  },
  {
    id: "4",
    from: "Jack · BloomFast",
    message: "Florist onboarding flow needs a tutorial step",
    time: "2d ago",
    status: "accepted",
    platform: "whatsapp"
  }
];

export const mockMeetings: MeetingItem[] = [
  { id: "1", title: "BloomFast Standup", time: "9:00 AM", duration: "15 min", type: "standup", project: "BloomFast" },
  { id: "2", title: "API Gateway Review", time: "11:30 AM", duration: "45 min", type: "review", project: "API Gateway" },
  { id: "3", title: "Client Sync · Elara", time: "2:00 PM", duration: "30 min", type: "client", project: "Elara Games" }
];

export const mockCalendarEvents: Record<string, CalendarDayData> = {
  "2026-04-21": {
    meetings: [
      { id: "1", title: "BloomFast Standup", time: "9:00 AM", duration: "15 min", type: "standup", project: "BloomFast" },
      { id: "2", title: "API Gateway Review", time: "11:30 AM", duration: "45 min", type: "review", project: "API Gateway" },
      { id: "3", title: "Client Sync · Elara", time: "2:00 PM", duration: "30 min", type: "client", project: "Elara Games" }
    ],
    deadlines: []
  },
  "2026-04-22": {
    meetings: [
      { id: "4", title: "Sprint Planning", time: "10:00 AM", duration: "60 min", type: "meeting", project: "BloomFast" }
    ],
    deadlines: []
  },
  "2026-04-24": {
    meetings: [
      { id: "5", title: "Elara Design Review", time: "3:00 PM", duration: "30 min", type: "review", project: "Elara Games" }
    ],
    deadlines: [mockDeadlines[0]]
  },
  "2026-04-26": {
    meetings: [],
    deadlines: [mockDeadlines[1]]
  },
  "2026-05-02": {
    meetings: [],
    deadlines: [mockDeadlines[2]]
  }
};

export const mockRoles: RoleOption[] = [
  { key: "manager", label: "Manager", icon: "briefcase" },
  { key: "dev", label: "Dev", icon: "code" },
  { key: "client", label: "Client", icon: "eye" }
];

export const mockSocratesSuggestions: SocratesSuggestionGroups = {
  dashboard: [
    "What's due soon?",
    "Any pending requests?",
    "Today's meetings?"
  ],
  project: [
    "What's due soon?",
    "Any pending requests?",
    "Today's meetings?"
  ]
};

export const mockSocratesReplies: SocratesReplyGroups = {
  dashboard: "I can summarize your deadlines, outstanding requests, and today's meetings from the current product state once the backend is connected.",
  project: "I can summarize your deadlines, outstanding requests, and today's meetings from the current product state once the backend is connected."
};

export const mockSocratesMessages: ChatMessage[] = [];

// Full catalog of connectors Orchestra supports (shown on Connectors page).
export const mockSupportedConnectors: Pick<IntegrationStatus, "id" | "name" | "category">[] = [
  { id: "i-vscode", name: "VS Code", category: "editor" }
];

// Integration connection status — one entry per external service per project.
// connected: false = not yet authorised; lastSyncedAt only present when connected: true.
export const mockIntegrationStatuses: Record<string, IntegrationStatus[]> = {
  "1": [
    { id: "i-vscode", name: "VS Code", category: "editor", connected: false, accountConnected: false }
  ],
  "2": [
    { id: "i-vscode", name: "VS Code", category: "editor", connected: false, accountConnected: false }
  ],
  "3": [
    { id: "i-vscode", name: "VS Code", category: "editor", connected: false, accountConnected: false }
  ]
};
