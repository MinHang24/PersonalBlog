"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { Toast } from "@figma/astraui"
import { copyText } from "../lib/clipboard"

const FeedbackContext = createContext<(text: string) => Promise<void>>(
  async () => {},
)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<{
    text: string
    success: boolean
    key: number
  }>()
  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(() => setMessage(undefined), 3500)
    return () => window.clearTimeout(timeout)
  }, [message])
  const copy = useCallback(async (text: string) => {
    const success = await copyText(text)
    setMessage({
      success,
      text: success
        ? "已复制到剪贴板"
        : "无法访问剪贴板，请手动选择并复制文本。",
      key: Date.now(),
    })
  }, [])
  return (
    <FeedbackContext.Provider value={copy}>
      {children}
      {message && (
        <div
          className="toast-region"
          role="status"
          aria-live="polite"
          key={message.key}
        >
          <Toast
            message={message.text}
            variant={message.success ? "success" : "error"}
            progress={100}
            showCancel={false}
            onDismiss={() => setMessage(undefined)}
          />
        </div>
      )}
    </FeedbackContext.Provider>
  )
}

export const useCopy = () => useContext(FeedbackContext)
