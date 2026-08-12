"use client"

  import { useEffect } from "react"
  import { useRouter, useSearchParams } from "next/navigation"
  import { Suspense } from "react"

  // Secret token - MUST match the token in your LWC
  const SECRET_SF_TOKEN = "kizzy-sf-2024-secure-auth-token"

  function HomeContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
      const sftoken = searchParams.get("sftoken")
      const recordId = searchParams.get("recordId")

      // Check if coming from Salesforce with valid token
      if (sftoken === SECRET_SF_TOKEN) {
        // Auto-authenticate user
        sessionStorage.setItem("isAuthenticated", "true")
        
        // Store recordId if available (for future use)
        if (recordId) {
          sessionStorage.setItem("salesforceRecordId", recordId)
        }
        
        // Mark as Salesforce embedded (to hide logout button in iframe)
        sessionStorage.setItem("isSalesforceEmbed", "true")
        
        // Redirect to PDF extract page
        router.push("/pdf-extract")
      } else {
        // No valid token, go to login
        router.push("/login")
      }
    }, [router, searchParams])

    // Show loading while checking authentication
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  export default function Home() {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    )
  }
