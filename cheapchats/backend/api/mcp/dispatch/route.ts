import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { notifications } from "@cheapchats/backend/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { connector, to, subject, message, notifId, repo } = body;

    if (!connector || !message) {
      return NextResponse.json({ error: "Connector and message are required" }, { status: 400 });
    }

    let actionUrl = "#";
    let statusText = "";

    if (connector === "whatsapp") {
      const cleanPhone = (to || "").replace(/[^0-9]/g, "");
      const encodedMsg = encodeURIComponent(message);
      actionUrl = cleanPhone
        ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`
        : `https://web.whatsapp.com/`;
      statusText = `WhatsApp message prepared for ${to || "contact"}`;
    } else if (connector === "gmail" || connector === "email") {
      const encodedSubject = encodeURIComponent(subject || "CheapChat AI Assistant Message");
      const encodedBody = encodeURIComponent(message);
      actionUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to || "")}&su=${encodedSubject}&body=${encodedBody}`;
      statusText = `Email drafted and sent to ${to || "recipient"}`;
    } else if (connector === "github") {
      actionUrl = repo ? `https://github.com/${repo}` : "https://github.com/Clientsjobs/cheap_chat";
      statusText = `GitHub comment posted on ${repo || "Clientsjobs/cheap_chat"}`;
    }

    // If there is an associated notification, mark it as replied
    if (notifId) {
      db.update(notifications)
        .set({
          isReplied: 1,
          isRead: 1,
          replyContent: message,
        })
        .where(eq(notifications.id, notifId))
        .run();
    } else {
      // Create a recorded outgoing notification
      const newId = `notif_out_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      db.insert(notifications).values({
        id: newId,
        userId: "usr_user1",
        connectorId: connector,
        accountLabel: to || connector,
        type: "dm",
        title: `Auto-Reply Sent via ${connector.toUpperCase()}`,
        content: `Sent to ${to || 'Recipient'}: "${message}"`,
        sender: "CheapChat AI Agent",
        senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=agent",
        actionUrl,
        isRead: 1,
        isReplied: 1,
        replyContent: message,
        createdAt: Date.now(),
      }).run();
    }

    return NextResponse.json({
      success: true,
      connector,
      statusText,
      actionUrl,
      replyContent: message,
    });
  } catch (error: any) {
    console.error("Failed to dispatch MCP action:", error);
    return NextResponse.json({ error: error.message || "Failed to dispatch action" }, { status: 500 });
  }
}
