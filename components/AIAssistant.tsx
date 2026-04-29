'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, X, Send, Lock, Loader, ChevronDown, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const FAQ_ITEMS = [
  'Hoe registreer ik mijn uren?',
  'Hoe maak ik een factuur aan?',
  'Wat is het urencriterium?',
  'Hoe exporteer ik naar PDF?',
  'Wat zit er in het Pro plan?',
  'Hoe scan ik een bon?',
  'Hoe geef ik mijn accountant toegang?',
  'Hoe werkt de kilometerregistratie?',
]

export default function AIAssistant() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isPremium = session?.user?.plan === 'PREMIUM'

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (open && isPremium) inputRef.current?.focus()
  }, [open, isPremium])

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setStreaming(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages([...next, assistantMsg])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      if (!res.ok) throw new Error('Fout bij ophalen antwoord')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: accumulated }
          return updated
        })
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Er is iets misgegaan. Probeer het opnieuw.' }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl shadow-purple-500/10 border border-[#E8E8F5] flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-brand-500">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-white opacity-90" />
                <span className="text-sm font-bold text-white">Tasco Assistent</span>
                {!isPremium && (
                  <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-semibold">Premium</span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {isPremium ? (
              <>
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
                  {messages.length === 0 && (
                    <div className="space-y-3">
                      <p className="text-xs text-[#9898B0] text-center">Stel een vraag of kies een onderwerp:</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {FAQ_ITEMS.map(q => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="text-left text-xs text-[#4A4A6A] bg-[#F5F4FF] hover:bg-purple-50 hover:text-purple-700 px-3 py-2 rounded-xl transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[85%] text-sm px-3 py-2 rounded-2xl leading-relaxed whitespace-pre-wrap',
                          msg.role === 'user'
                            ? 'bg-brand-500 text-white rounded-br-sm'
                            : 'bg-[#F5F4FF] text-[#0F0F1E] rounded-bl-sm'
                        )}
                      >
                        {msg.content || (streaming && i === messages.length - 1 ? (
                          <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-[#9898B0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#9898B0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#9898B0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        ) : '')}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-[#E8E8F5]">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Stel je vraag..."
                      rows={1}
                      disabled={streaming}
                      className="flex-1 resize-none text-sm text-[#0F0F1E] placeholder-[#9898B0] bg-[#F5F4FF] rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50 max-h-24"
                      style={{ lineHeight: '1.4' }}
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || streaming}
                      className="w-9 h-9 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
                    >
                      {streaming ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Locked state for FREE / PRO */
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Lock notice */}
                <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-start gap-3">
                  <Lock size={16} className="text-purple-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-purple-800 mb-0.5">Alleen beschikbaar voor Premium</p>
                    <p className="text-xs text-purple-600">Upgrade voor onbeperkte AI-hulp in het Nederlands.</p>
                    <Link href="/upgrade" className="mt-1.5 inline-block text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors">
                      Upgrade naar Premium
                    </Link>
                  </div>
                </div>

                {/* FAQ visible to all */}
                <div className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-[#0F0F1E] mb-3">Veelgestelde vragen</p>
                  {FAQ_ITEMS.map(q => (
                    <div key={q} className="flex items-center gap-2 text-xs text-[#6B6B8A] bg-[#F5F4FF] px-3 py-2.5 rounded-xl">
                      <Lock size={11} className="text-purple-400 shrink-0" />
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 bg-gradient-to-br from-purple-600 to-brand-500 text-white rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all hover:shadow-xl hover:shadow-purple-500/40"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown size={22} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
