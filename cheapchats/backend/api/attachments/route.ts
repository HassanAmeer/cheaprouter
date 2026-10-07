import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { attachments } from "@cheapchats/backend/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";
import fs from "fs";
import path from "path";

// Helper to determine file category
function getFileCategory(fileName: string, mimeType: string): string {
  const ext = path.extname(fileName).toLowerCase();
  
  if (mimeType.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".ico", ".tiff", ".avif"].includes(ext)) {
    return "image";
  }
  if ([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".csv", ".tsv", ".txt", ".md", ".rtf", ".odt", ".ods"].includes(ext) || mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("sheet")) {
    return "document";
  }
  if ([".js", ".jsx", ".ts", ".tsx", ".py", ".html", ".css", ".scss", ".json", ".xml", ".yaml", ".yml", ".sql", ".rs", ".go", ".java", ".c", ".cpp", ".h", ".cs", ".php", ".rb", ".sh", ".bash", ".zsh", ".toml", ".ini"].includes(ext)) {
    return "code";
  }
  if (mimeType.startsWith("audio/") || [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac", ".wma"].includes(ext)) {
    return "audio";
  }
  if (mimeType.startsWith("video/") || [".mp4", ".webm", ".mov", ".avi", ".mkv", ".wmv"].includes(ext)) {
    return "video";
  }
  if ([".zip", ".tar", ".gz", ".7z", ".rar", ".bz2", ".xz"].includes(ext)) {
    return "archive";
  }
  return "other";
}

// Helper to check if file is text-readable
function isTextReadable(category: string, ext: string): boolean {
  if (category === "code") return true;
  if ([".txt", ".md", ".csv", ".tsv", ".json", ".xml", ".yaml", ".yml", ".sql", ".log", ".env"].includes(ext)) return true;
  return false;
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const typeFilter = searchParams.get("type") || "";

    const allAttachments = session.role === "ADMIN"
      ? db.select().from(attachments).orderBy(desc(attachments.createdAt)).all()
      : db.select().from(attachments).where(eq(attachments.userId, session.id)).orderBy(desc(attachments.createdAt)).all();

    let filtered = allAttachments;
    if (query) {
      filtered = filtered.filter((f: any) => f.name.toLowerCase().includes(query.toLowerCase()));
    }
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((f: any) => (f.type || getFileCategory(f.name, f.mimeType || "")).toLowerCase() === typeFilter.toLowerCase());
    }

    return NextResponse.json({ files: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch attachments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session.id;

    const formData = await req.formData();
    const rawFiles: any[] = [];

    // Collect all uploaded files from form data
    for (const [key, value] of formData.entries()) {
      if (value && typeof value === "object" && ("arrayBuffer" in value || "name" in value || (value as any) instanceof Blob)) {
        rawFiles.push(value);
      }
    }

    if (rawFiles.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const savedFiles: any[] = [];

    for (const file of rawFiles) {
      if (!file || typeof file.name !== "string" || file.size <= 0) {
        return NextResponse.json({ error: "Invalid file" }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds the 10MB limit` }, { status: 413 });
      }
      if (/\.(html?|svg|js|mjs)$/i.test(file.name)) {
        return NextResponse.json({ error: `Files of type ${path.extname(file.name).toLowerCase()} are not allowed` }, { status: 415 });
      }

      const id = `att_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const ext = path.extname(file.name).toLowerCase();
      const sanitizedBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const storedFileName = `${id}_${sanitizedBase}${ext}`;
      const filePath = path.join(uploadsDir, storedFileName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write to disk
      await fs.promises.writeFile(filePath, buffer);

      const mimeType = file.type || "application/octet-stream";
      const type = getFileCategory(file.name, mimeType);
      const url = `/uploads/${storedFileName}`;
      const createdAt = Date.now();

      // Extract content representation for direct AI & preview usage
      let content: string | undefined = undefined;
      if (type === "image") {
        // Base64 data URL for vision models and instant thumbnails
        content = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else if (isTextReadable(type, ext)) {
        // Read text content
        content = buffer.toString("utf-8");
      }

      // Save to SQLite only if not incognito
      const isIncognito = formData.get("isIncognito") === "true";
      if (!isIncognito) {
        db.insert(attachments).values({
          id,
          userId,
          name: file.name,
          url,
          size: file.size,
          type,
          mimeType,
          createdAt,
        }).run();
      }

      savedFiles.push({
        id,
        userId,
        name: file.name,
        url,
        size: file.size,
        type,
        mimeType,
        createdAt,
        content,
      });
    }

    return NextResponse.json({
      success: true,
      files: savedFiles,
      file: savedFiles[0],
    });
  } catch (error: any) {
    console.error("[ATTACHMENTS UPLOAD ERROR]:", error);
    return NextResponse.json({ error: error.message || "Failed to upload attachment" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "File ID required" }, { status: 400 });

    const item = db.select().from(attachments).where(eq(attachments.id, id)).get();
    if (!item || (item.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    if (item && item.url) {
      const fileName = path.basename(item.url);
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn("Could not delete disk file:", filePath, e);
        }
      }
    }

    db.delete(attachments).where(eq(attachments.id, id)).run();
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete attachment" }, { status: 500 });
  }
}
