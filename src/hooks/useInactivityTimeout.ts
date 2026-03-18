'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseInactivityTimeoutOptions {
  timeout: number // in milliseconds
  onTimeout: () => void
  enabled?: boolean
}

export function useInactivityTimeout({
  timeout,
  onTimeout,
  enabled = true,
}: UseInactivityTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const onTimeoutRef = useRef(onTimeout)

  // Keep the callback ref up to date
  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  const resetTimer = useCallback(() => {
    if (!enabled) return

    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timer
    timeoutRef.current = setTimeout(() => {
      onTimeoutRef.current()
    }, timeout)
  }, [timeout, enabled])

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      return
    }

    // Activity event listeners
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer()
    }

    // Initialize timer
    resetTimer()

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [resetTimer, enabled])

  return { resetTimer }
}
