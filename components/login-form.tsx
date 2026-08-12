"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const recordId = new URLSearchParams(window.location.search).get("recordId")
    if (recordId) {
      sessionStorage.setItem("salesforceRecordId", recordId)
      sessionStorage.setItem("isSalesforceEmbed", "true")
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simple client-side validation
    if (username === "KizzyConsulting" && password === "Kizzy@12345") {
      // The mount handler stores the Salesforce record ID before login interaction.
      // Set a flag in sessionStorage to indicate user is logged in
      sessionStorage.setItem("isAuthenticated", "true")
      router.push("/pdf-extract")
    } else {
      setError("Invalid username or password")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] flex items-center justify-center p-4 sm:p-5">
      <a
        href="https://kizzyconsulting.com/agentforce-consulting-services/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50 transition-transform hover:scale-105"
      >
        <Image
          src="/images/kizzy-logo.png"
          alt="Kizzy Consulting"
          width={80}
          height={80}
          className="h-16 sm:h-20 w-16 sm:w-20"
        />
      </a>

      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] px-6 sm:px-10 py-8 sm:py-12 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)] animate-pulse" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-white mb-2">DocSense AI</h1>
            <p className="text-white/90 text-sm sm:text-base">Login to continue</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#3b82f6] focus:outline-none transition-colors duration-200 bg-gray-50 hover:bg-white text-base sm:text-sm"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#3b82f6] focus:outline-none transition-colors duration-200 bg-gray-50 hover:bg-white text-base sm:text-sm"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-500 text-red-800 rounded-xl text-sm font-medium animate-in fade-in duration-300">
                ✕ {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
