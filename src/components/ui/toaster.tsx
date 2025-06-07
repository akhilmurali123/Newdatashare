"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import React from "react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}
            className="flex w-[500px] shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 bg-gray-800 text-gray-100"
          >
            <div className="grid gap-1 w-full">
              {title && <ToastTitle className="text-gray-50 font-semibold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-gray-200 [&>a]:underline [&>a]:text-blue-300">{description}</ToastDescription>
              )}
            </div>
            {action && (
              <div className="mt-2">
                {React.cloneElement(action as React.ReactElement, {
                  className: "bg-transparent border border-gray-400 text-gray-100 hover:bg-gray-700 hover:text-white transition-colors"
                })}
              </div>
            )}
            <ToastClose className="text-gray-400 hover:text-gray-100"/>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
