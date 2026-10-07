"use client";

import { use } from "react";
import ChatWorkspace from "@cheapchats/frontend/components/Chat/ChatWorkspace";

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ChatWorkspace initialConversationId={id} />;
}
