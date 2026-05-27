import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { DEFAULT_WORKSPACE_NAME, WORKSPACE_ID } from "../lib/workspace";
import { useWorkspaceStore } from "../store/workspaceStore";

export type PageContext = "memory" | "connectors";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "diagram" | "citation";
  diagram?: {
    kind: "dependency" | "flowchart" | "sequence" | "usecase";
    mermaid: string;
    stats?: { label: string; value: string | number; color: string }[];
  };
  citations?: {
    source: string;
    excerpt: string;
    anchor: string;
  }[];
  timestamp: Date;
};

type DiagramKind = NonNullable<Message["diagram"]>["kind"];

type SocratesContextType = {
  messages: Message[];
  isStreaming: boolean;
  pageContext: PageContext;
  projectId: string | null;
  suggestions: string[];
  sendMessage: (content: string) => Promise<void>;
  setPageContext: (ctx: PageContext) => void;
};

const PAGE_SUGGESTIONS: Record<PageContext, string[]> = {
  memory: ["Find all decisions about auth", "What did the client say about payments?", "Show changes from last week"],
  connectors: ["Is VS Code connected?", "What does the extension sync?", "How do I connect VS Code?"]
};

let persistedMessages: Message[] = [];
let persistedPageContext: PageContext = "memory";

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `msg_${Math.random().toString(36).slice(2, 10)}`;
}

function includesAny(content: string, terms: string[]) {
  return terms.some((term) => content.includes(term));
}

function resolvePageContext(pathname: string): PageContext {
  if (pathname.includes("/memory") || pathname.includes("/docs/")) {
    return "memory";
  }

  if (pathname.includes("/connectors")) {
    return "connectors";
  }

  return "memory";
}

function getProjectName() {
  return useWorkspaceStore.getState().workspaceName || DEFAULT_WORKSPACE_NAME;
}

function buildDependencyDiagram(projectName: string) {
  return `graph LR
  Brief([${projectName} Brief]) --> DAG([Delivery DAG])
  DAG --> Build([Build Scope])
  Messages([Client Messages]) -.-> Changes([Accepted Changes])
  Changes -.-> Decisions([Decisions])
  DAG --> Changes
  
  style Brief fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style DAG fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style Build fill:#EFEEEC,stroke:#5A5450,color:#1A1612
  style Messages fill:#EFEEEC,stroke:#5A5450,color:#1A1612
  style Changes fill:#F3E8D9,stroke:#B8543D,color:#1A1612
  style Decisions fill:#EFEEEC,stroke:#5A5450,color:#1A1612`;
}

function buildFlowchartDiagram(projectName: string) {
  return `flowchart TD
  A([${projectName} Order Placed]) --> B{Payment OK?}
  B -->|Yes| C[Create Order]
  B -->|No| D[/Notify Buyer/]
  C --> E{Driver Available?}
  E -->|Yes| F[Assign Driver]
  E -->|No| G[Queue Order]
  F --> H{Manager Approval?}
  H -->|Yes| I[Dispatch]
  H -->|No| G
  I --> J([Delivered])
  
  style A fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style J fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style B fill:#F3E8D9,stroke:#B8543D,color:#1A1612
  style E fill:#F3E8D9,stroke:#B8543D,color:#1A1612
  style H fill:#F3E8D9,stroke:#B8543D,color:#1A1612`;
}

function buildSequenceDiagram(projectName: string) {
  return `sequenceDiagram
  autonumber
  actor Buyer
  participant API as API Gateway
  participant Orders as Order Service
  participant Driver as Driver Assignment
  participant Ops as Admin Panel
  
  Buyer->>API: Create ${projectName} order
  API->>Orders: Validate payload
  Orders->>Driver: Request availability
  Driver-->>Orders: Driver candidate found
  Orders->>Ops: Request manager approval
  Ops-->>Orders: Approved
  Orders-->>Buyer: Dispatch confirmed`;
}

function buildUseCaseDiagram(projectName: string) {
  return `graph LR
  Buyer([Buyer])
  Manager([Manager])
  Driver([Driver])
  
  subgraph ${projectName}
    Search[Browse & Search]
    Checkout[Checkout]
    Assign[Assign Driver]
    Approve[Approve Dispatch]
    Track[Track Delivery]
  end
  
  Buyer --> Search
  Buyer --> Checkout
  Buyer --> Track
  Manager --> Approve
  Driver --> Assign
  
  style Checkout fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style Approve fill:#F3E8D9,stroke:#B8543D,color:#1A1612
  style Assign fill:#EFEEEC,stroke:#5A5450,color:#1A1612`;
}

function pickTextResponse(pageContext: PageContext, content: string, projectName: string) {
  const responses: Record<PageContext, string[]> = {
    memory: [
      `Found **4 documents** mentioning authentication. The key decision was OAuth removal. Current truth: email/password only for v1.`,
      `The client mentioned payments in **3 messages**. Stripe is confirmed, payouts must never block dispatch, and the revenue share is 70/30.`,
      `**Last week's changes**: OAuth removed, manager approval added to driver flow, and Pro subscription deferred. All 3 are accepted in project memory.`
    ],
    connectors: [
      `**VS Code** is not connected for ${projectName} yet. Connect it from the Connectors page to sync workspace context.`,
      `Once VS Code is connected, Orchestra can index open files, recent edits, and local project notes from your editor.`,
      `The VS Code extension keeps context fresh without leaving your development flow.`
    ]
  };

  const options = responses[pageContext];

  if (pageContext === "memory") {
    if (includesAny(content, ["auth", "authentication"])) {
      return options[0];
    }

    if (includesAny(content, ["payment", "payments"])) {
      return options[1];
    }

    if (includesAny(content, ["last week", "changes"])) {
      return options[2];
    }
  }

  if (pageContext === "connectors") {
    if (includesAny(content, ["connected", "connect", "setup"])) {
      return options[0];
    }

    if (includesAny(content, ["sync", "extension", "index"])) {
      return options[1];
    }

    if (includesAny(content, ["how", "vscode", "code"])) {
      return options[2];
    }
  }

  return options[0];
}

export const SocratesContext = createContext<SocratesContextType | null>(null);

export function SocratesProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>(persistedMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pageContext, setPageContextState] = useState<PageContext>(persistedPageContext);
  const projectId = WORKSPACE_ID;

  const derivedPageContext = useMemo(() => resolvePageContext(location.pathname), [location.pathname]);

  useEffect(() => {
    setPageContextState(derivedPageContext);
  }, [derivedPageContext]);

  useEffect(() => {
    persistedMessages = messages;
  }, [messages]);

  useEffect(() => {
    persistedPageContext = pageContext;
  }, [pageContext]);

  const suggestions = PAGE_SUGGESTIONS[pageContext];

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();

      if (!trimmed || isStreaming) {
        return;
      }

      const userMessage: Message = {
        id: createId(),
        role: "user",
        content: trimmed,
        type: "text",
        timestamp: new Date()
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setIsStreaming(true);

      const lowerContent = trimmed.toLowerCase();
      const projectName = getProjectName();
      const isDiagramRequest = includesAny(lowerContent, ["diagram", "flowchart", "dependency", "map", "sequence", "use case", "usecase"]);
      const isDependencyMap = includesAny(lowerContent, ["dependency", "map"]);
      const isSequenceDiagram = lowerContent.includes("sequence");
      const isUseCaseDiagram = includesAny(lowerContent, ["use case", "usecase"]);

      await delay(800);

      let response: Message;

      if (isDiagramRequest) {
        let kind: DiagramKind = "flowchart";
        let mermaid = buildFlowchartDiagram(projectName);
        let contentPrefix = `Generated from the current ${pageContext.replace("-", " ")} context for ${projectName}.`;

        if (isDependencyMap) {
          kind = "dependency";
          mermaid = buildDependencyDiagram(projectName);
          contentPrefix = `Here's the live dependency map for ${projectName}. I found 2 unresolved nodes and 3 critical paths.`;
        } else if (isSequenceDiagram) {
          kind = "sequence";
          mermaid = buildSequenceDiagram(projectName);
          contentPrefix = `Generated the latest interaction sequence for ${projectName} based on the current project state.`;
        } else if (isUseCaseDiagram) {
          kind = "usecase";
          mermaid = buildUseCaseDiagram(projectName);
          contentPrefix = `Generated a use case view for ${projectName} from the current project context.`;
        }

        response = {
          id: createId(),
          role: "assistant",
          content: contentPrefix,
          type: "diagram",
          diagram: {
            kind,
            mermaid,
            stats:
              kind === "dependency"
                ? [
                    { label: "Critical", value: 4, color: "#9E3B2E" },
                    { label: "Risky", value: 3, color: "#B8543D" },
                    { label: "Changes", value: 2, color: "#5A5450" }
                  ]
                : undefined
          },
          timestamp: new Date()
        };
      } else {
        const citations = includesAny(lowerContent, ["where", "source"])
          ? [
              {
                source: `${projectName} PRD v2 · Section 3`,
                excerpt: "Manager approval required before driver assignment confirmed.",
                anchor: "overview"
              }
            ]
          : undefined;

        response = {
          id: createId(),
          role: "assistant",
          content: pickTextResponse(pageContext, lowerContent, projectName),
          type: citations ? "citation" : "text",
          citations,
          timestamp: new Date()
        };
      }

      setMessages((currentMessages) => [...currentMessages, { ...response, content: "" }]);

      const words = response.content.split(" ");
      for (let index = 0; index < words.length; index += 1) {
        await delay(30);
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === response.id ? { ...message, content: words.slice(0, index + 1).join(" ") } : message
          )
        );
      }

      if (response.diagram || response.citations) {
        setMessages((currentMessages) => currentMessages.map((message) => (message.id === response.id ? response : message)));
      }

      setIsStreaming(false);
    },
    [isStreaming, pageContext, projectId]
  );

  return (
    <SocratesContext.Provider
      value={{
        messages,
        isStreaming,
        pageContext,
        projectId,
        suggestions,
        sendMessage,
        setPageContext: setPageContextState
      }}
    >
      {children}
    </SocratesContext.Provider>
  );
}

export function useSocrates() {
  const context = useContext(SocratesContext);

  if (!context) {
    throw new Error("useSocrates must be used within SocratesProvider");
  }

  return context;
}
