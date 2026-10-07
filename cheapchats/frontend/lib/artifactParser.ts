import { Artifact, ArtifactFile, useAppStore } from "./store";

export function applySearchReplacePatch(originalContent: string, patchContent: string): string {
  if (!originalContent) return patchContent;

  // Pattern matches <<<<<<< SEARCH ... ======= ... >>>>>>> REPLACE
  // Tolerant of varying <, =, > counts (3 to 10 characters) and line endings
  const blockRegex = /<{3,10}\s*SEARCH\r?\n([\s\S]*?)\r?\n={3,10}\r?\n([\s\S]*?)(?:\r?\n>{3,10}\s*REPLACE|$)/gi;
  let result = originalContent;
  let match;

  while ((match = blockRegex.exec(patchContent)) !== null) {
    const searchTarget = match[1];
    const replacement = match[2] || "";

    if (!searchTarget) continue;

    // 1. Direct exact replacement
    if (result.includes(searchTarget)) {
      result = result.replace(searchTarget, replacement);
      continue;
    }

    // 2. Trimmed match if outer whitespace differs
    const trimmedTarget = searchTarget.trim();
    if (trimmedTarget && result.includes(trimmedTarget)) {
      result = result.replace(trimmedTarget, replacement.trim());
      continue;
    }

    // 3. Line-by-line normalized whitespace match
    const targetLines = searchTarget.trim().split("\n").map(l => l.trim()).filter(Boolean);
    if (targetLines.length > 0) {
      const originalLines = result.split("\n");
      let foundIndex = -1;

      for (let i = 0; i <= originalLines.length - targetLines.length; i++) {
        let allMatch = true;
        for (let j = 0; j < targetLines.length; j++) {
          if (originalLines[i + j].trim() !== targetLines[j]) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex !== -1) {
        originalLines.splice(foundIndex, targetLines.length, replacement);
        result = originalLines.join("\n");
      }
    }
  }

  return result;
}

export function parseAllArtifactFiles(content: string, fallbackTitle = "Interactive Project"): Artifact | null {
  const files: ArtifactFile[] = [];
  let mainContent = "";
  let mainType: "html" | "code" | "svg" | "markdown" | "mermaid" = "code";
  let mainTitle = fallbackTitle;

  // 1. Try to parse XML Artifacts first
  const artifactRegex = /<cheapchatArtifact\s+id="([^"]+)"\s+title="([^"]+)">([\s\S]*?)(?:<\/cheapchatArtifact>|$)/i;
  const artifactMatch = content.match(artifactRegex);

  if (artifactMatch) {
    mainTitle = artifactMatch[2].replace(/\bartifact\b/gi, "").replace(/generated\s+/gi, "").trim() || fallbackTitle;
    const actionsContent = artifactMatch[3];
    
    // Parse actions inside the artifact (file, patch, shell)
    const actionRegex = /<cheapchatAction\s+type="([^"]+)"(?:\s+filePath="([^"]+)")?>([\s\S]*?)(?:<\/cheapchatAction>|$)/gi;
    const actions = Array.from(actionsContent.matchAll(actionRegex));

    actions.forEach((actionMatch, index) => {
      const rawType = (actionMatch[1] || "").toLowerCase().trim(); // file, patch, shell
      const filePath = actionMatch[2] || (rawType === "shell" ? `command_${index}.sh` : `index.html`);
      let cleanCode = actionMatch[3].trim();
      
      // Strip any markdown backticks wrapper if present (even if unclosed)
      cleanCode = cleanCode.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/\n?```$/, '').trim();
      if (!cleanCode) return;

      let fileFinalContent = cleanCode;

      // Handle targeted surgical code patch
      if (rawType === "patch" || cleanCode.includes("<<<<<<< SEARCH") || cleanCode.includes("<<<< SEARCH")) {
        const existingArtifact = typeof window !== "undefined" ? useAppStore.getState().activeArtifact : null;
        let baseContent = "";
        if (existingArtifact) {
          const existingFile = existingArtifact.files?.find((f: { name?: string; id?: string; content?: string }) => f.name === filePath || f.id === filePath);
          baseContent = existingFile?.content || existingArtifact.content || "";
        }
        if (baseContent) {
          fileFinalContent = applySearchReplacePatch(baseContent, cleanCode);
        }
      }

      let language = "text";
      if (rawType === "shell") language = "shell";
      else if (filePath.endsWith(".html") || fileFinalContent.includes("<div") || fileFinalContent.includes("<!DOCTYPE") || fileFinalContent.includes("<html")) language = "html";
      else if (filePath.endsWith(".css")) language = "css";
      else if (filePath.endsWith(".js") || filePath.endsWith(".jsx") || filePath.endsWith(".tsx")) language = "javascript";
      else if (filePath.endsWith(".py")) language = "python";
      else if (filePath.endsWith(".json")) language = "json";
      else if (filePath.endsWith(".svg")) language = "svg";

      files.push({
        id: `file_${index}_${Date.now()}`,
        name: filePath,
        content: fileFinalContent,
        language: language,
      });

      const isVisual = language === "html" || language === "svg" || fileFinalContent.includes("<div") || fileFinalContent.includes("<html") || fileFinalContent.includes("<!DOCTYPE");

      if (index === 0 || isVisual) {
        if (!mainContent || isVisual) {
          mainContent = fileFinalContent;
          mainType = language === "svg" ? "svg" : "html";
        }
      }
    });

    // Retain unchanged files from existing active artifact if this was an incremental patch
    if (typeof window !== "undefined") {
      const existingArtifact = useAppStore.getState().activeArtifact;
      if (existingArtifact && existingArtifact.files) {
        for (const existingFile of existingArtifact.files) {
          if (!files.some(f => f.name === existingFile.name)) {
            files.push(existingFile);
          }
        }
      }
    }

    if (files.length > 0) {
      return {
        title: mainTitle,
        type: mainType,
        language: files[0]?.language || "html",
        content: mainContent,
        files,
      };
    }
  }

  // 2. Fallback to Markdown Code Blocks parsing (Old behavior & streaming tolerance)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)(?:```|$)/g;
  const matches = Array.from(content.matchAll(codeBlockRegex));

  if (matches.length === 0) return null;

  let htmlCount = 0;
  let cssCount = 0;
  let jsCount = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const rawLang = (match[1] || "html").toLowerCase();
    const code = match[2].trim();

    if (!code) continue;

    // Try to extract filename from code comment in first line
    let fileName = "";
    const firstLine = code.split("\n")[0].trim();

    const nameMatch = firstLine.match(/^(?:<!--|\/\*|\/\/)\s*([a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+)\s*(?:-->|\*\/)?$/i);
    if (nameMatch) {
      fileName = nameMatch[1];
    } else {
      if (rawLang === "html" || code.includes("<html") || code.includes("<!DOCTYPE") || code.includes("<div") || code.includes("<body")) {
        htmlCount++;
        fileName = htmlCount === 1 ? "index.html" : `page${htmlCount}.html`;
      } else if (rawLang === "css") {
        cssCount++;
        fileName = cssCount === 1 ? "style.css" : `style${cssCount}.css`;
      } else if (rawLang === "js" || rawLang === "javascript" || rawLang === "jsx" || rawLang === "tsx" || rawLang === "react") {
        jsCount++;
        fileName = jsCount === 1 ? "script.js" : `script${jsCount}.js`;
      } else if (rawLang === "svg") {
        fileName = "graphic.svg";
      } else if (rawLang === "json") {
        fileName = "data.json";
      } else if (rawLang === "python" || rawLang === "py") {
        fileName = "main.py";
      } else {
        fileName = `file_${i + 1}.${rawLang}`;
      }
    }

    files.push({
      id: `file_${i}_${Date.now()}`,
      name: fileName,
      content: code,
      language: rawLang,
    });

    const isVisual =
      rawLang === "html" ||
      rawLang === "svg" ||
      rawLang === "jsx" ||
      rawLang === "tsx" ||
      rawLang === "react" ||
      code.includes("<div") ||
      code.includes("<html") ||
      code.includes("<!DOCTYPE") ||
      code.includes("import React");

    if (i === 0 || isVisual) {
      if (!mainContent || isVisual) {
        mainContent = code;
        mainType = rawLang === "svg" ? "svg" : "html";
      }
    }
  }

  // Extract title if present
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1] && titleMatch[1].length < 50) {
    mainTitle = titleMatch[1].replace(/\bartifact\b/gi, "").trim();
  } else {
    const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1] && h1Match[1].length < 50) {
      mainTitle = h1Match[1].replace(/<[^>]+>/g, "").replace(/\bartifact\b/gi, "").trim();
    }
  }

  return {
    title: mainTitle,
    type: mainType,
    language: files[0]?.language || "html",
    content: mainContent,
    files,
  };
}
