import type { AnchorProvenance, Doc, DocViewerPayload, IntegrationStatus, RoleOption } from "./types";

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

export const mockRoles: RoleOption[] = [
  { key: "manager", label: "Manager", icon: "briefcase" },
  { key: "dev", label: "Dev", icon: "code" },
  { key: "client", label: "Client", icon: "eye" }
];

export const mockSupportedConnectors: Pick<IntegrationStatus, "id" | "name" | "category">[] = [
  { id: "i-vscode", name: "VS Code", category: "editor" }
];

// Integration connection status — one entry per external service per project.
// connected: false = not yet authorised; lastSyncedAt only present when connected: true.
export const mockIntegrationStatuses: Record<string, IntegrationStatus[]> = {
  "1": [{ id: "i-vscode", name: "VS Code", category: "editor", connected: false, accountConnected: false }]
};
