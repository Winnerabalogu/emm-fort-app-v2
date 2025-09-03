"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light" // Fixed theme since you don't have dark mode
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-orange-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600",
          success: "group-[.toast]:border-green-200 group-[.toast]:bg-green-50",
          error: "group-[.toast]:border-red-200 group-[.toast]:bg-red-50",
          warning: "group-[.toast]:border-amber-200 group-[.toast]:bg-amber-50",
          info: "group-[.toast]:border-blue-200 group-[.toast]:bg-blue-50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }