import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@cheapchats/backend/lib/auth";

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { action, data } = await req.json();

    if (action === "open_file" || action === "reveal") {
      if (!data || typeof data !== "string") {
        return NextResponse.json({ error: "No valid path provided" }, { status: 400 });
      }

    // Restrict file opening to the application workspace and public uploads.
    const trimmedPath = data.trim();
    const resolvedPath = path.normalize(path.join(process.cwd(), trimmedPath));
    const workspaceRoot = process.cwd();
    const uploadsRoot = path.join(workspaceRoot, "public", "uploads");
    const isSafe =
      resolvedPath.startsWith(workspaceRoot + path.sep) &&
      (resolvedPath.startsWith(uploadsRoot + path.sep) || resolvedPath === uploadsRoot);

    if (!isSafe) {
      return NextResponse.json({ error: "Path is outside the permitted uploads directory" }, { status: 403 });
    }

      // Verify that file/folder exists
      if (!fs.existsSync(resolvedPath)) {
        return NextResponse.json({ error: `File not found: ${trimmedPath}` }, { status: 404 });
      }

      // Safe cross-platform opener without shell injection vulnerability
      let cmd = "xdg-open";
      let args: string[] = [resolvedPath];

      if (process.platform === "win32") {
        cmd = "cmd.exe";
        args = ["/c", "start", '""', resolvedPath];
      } else if (process.platform === "darwin") {
        cmd = "open";
        args = [resolvedPath];
      } else {
        cmd = "xdg-open";
        args = [resolvedPath];
      }

      return new Promise<Response>((resolve) => {
        const child = spawn(cmd, args, {
          detached: true,
          stdio: "ignore",
        });

        child.on("error", (err) => {
          console.error("[OS Command Error]:", err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        });

        child.unref();
        resolve(NextResponse.json({ success: true, message: `Opened: ${resolvedPath}`, platform: process.platform }));
      });
    }

    if (action === "get_status") {
      return NextResponse.json({
        platform: process.platform,
        cwd: process.cwd(),
        nodeVersion: process.version,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "OS action failed" }, { status: 500 });
  }
}
