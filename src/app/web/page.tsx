'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router'

// Devonz stylesheets
import '@unocss/reset/tailwind-compat.css'
import '@xterm/xterm/css/xterm.css'
import '~/styles/index.scss'
import '~/styles/liquid-metal.css'
import './uno.css'
import './web_gen.css'

import { Header } from '~/components/header/Header'
import { BaseChat } from '~/components/chat/BaseChat'
import { ComponentErrorBoundary } from '~/components/ui/ComponentErrorBoundary'
import { clientLazy } from '~/utils/react'

const Chat = clientLazy(() => import('~/components/chat/Chat.client').then((m) => ({ default: m.Chat })))
const Menu = clientLazy(() => import('~/components/sidebar/Menu.client').then((m) => ({ default: m.Menu })))

export default function WebGenPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  if (!mounted) return null

  return (
    <BrowserRouter>
      <div
        id="main-content"
        className="flex flex-col h-screen w-screen overflow-hidden bg-devonz-elements-background-depth-1 text-devonz-elements-textPrimary"
        data-theme="dark"
      >
        <Suspense fallback={null}>
          <Menu />
        </Suspense>
        <Header />
        <ComponentErrorBoundary name="Chat">
          <Suspense fallback={<BaseChat />}>
            <Chat />
          </Suspense>
        </ComponentErrorBoundary>
      </div>
    </BrowserRouter>
  )
}
