'use client'

import React from 'react'

export default function WebGenPage() {
  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4 py-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg text-primary">WebGen Builder</span>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">v1.0</span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Chat Panel */}
        <div className="w-1/3 border-r p-4 flex flex-col justify-between bg-card">
          <div className="space-y-4">
            <h2 className="font-semibold text-base">AI Prompt Workbench</h2>
            <p className="text-xs text-muted-foreground">
              Describe what you want to build. WebGen will generate full-stack React components and code.
            </p>

            <textarea
              className="w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              rows={6}
              placeholder="e.g. Build a sleek dashboard with dark mode toggle and real-time chart cards..."
            />
          </div>

          <button className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Generate App
          </button>
        </div>

        {/* Live Code / Editor Preview Panel */}
        <div className="flex-1 bg-muted/20 p-6 flex flex-col items-center justify-center">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              ⚡
            </div>
            <h3 className="font-medium text-lg">WebGen Code & Preview Engine</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Integrated with Bun + Next.js App Router. Web_gen components run seamlessly under the /web route.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
