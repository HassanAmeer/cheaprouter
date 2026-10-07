import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { notifications, mcpServers } from "@cheapchats/backend/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Check if GitHub connector is registered or use default repo
    const githubConn = db.select().from(mcpServers).where(eq(mcpServers.id, "conn_github")).get();
    
    let repoName = "Clientsjobs/cheap_chat";
    let token = "";

    if (githubConn?.accountsJson) {
      try {
        const accs = JSON.parse(githubConn.accountsJson);
        if (accs.length > 0 && accs[0].repo) {
          repoName = accs[0].repo;
        }
      } catch {}
    }

    // Call Real Live GitHub API for latest commits & issues
    const headers: Record<string, string> = {
      "User-Agent": "CheapChat-AI-Agent",
      Accept: "application/vnd.github.v3+json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const commitsRes = await fetch(`https://api.github.com/repos/${repoName}/commits?per_page=3`, {
      headers,
    });

    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      for (const c of commits) {
        const notifId = `notif_gh_${c.sha.slice(0, 10)}`;
        const existing = db.select().from(notifications).where(eq(notifications.id, notifId)).get();
        if (!existing) {
          db.insert(notifications).values({
            id: notifId,
            userId: "usr_user1",
            connectorId: "github",
            accountLabel: repoName,
            type: "pr",
            title: `Live GitHub Commit: ${c.commit.message.split("\n")[0].slice(0, 60)}`,
            content: `Author: ${c.commit.author.name} (${c.commit.author.email})\nMessage: ${c.commit.message}\nCommit SHA: ${c.sha}`,
            sender: `@${c.author?.login || c.commit.author.name || 'HassanAmeer'}`,
            senderAvatar: c.author?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=git",
            actionUrl: c.html_url,
            isRead: 0,
            isReplied: 0,
            createdAt: new Date(c.commit.author.date).getTime(),
          }).run();
        }
      }
    }

    const allNotifs = db.select().from(notifications).orderBy(desc(notifications.createdAt)).all();
    const unreadCount = allNotifs.filter((n: any) => n.isRead === 0).length;

    return NextResponse.json({
      success: true,
      repo: repoName,
      message: `Successfully synchronized live GitHub events from ${repoName}`,
      unreadCount,
      notifications: allNotifs,
    });
  } catch (error: any) {
    console.error("Failed to sync GitHub:", error);
    return NextResponse.json({ error: error.message || "Failed to sync GitHub" }, { status: 500 });
  }
}
