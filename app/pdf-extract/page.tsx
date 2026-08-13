"use client"

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from "react"
import { Upload, X, FileText, ExternalLink, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
export default function PDFExtractionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [sheetUrl, setSheetUrl] = useState<string>("")
  const [showResult, setShowResult] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSalesforceEmbed, setIsSalesforceEmbed] = useState(false)
  const [salesforceRecordId, setSalesforceRecordId] = useState<string | null>(null)

  useEffect(() => {
    const recordIdFromUrl = new URLSearchParams(window.location.search).get("recordId")
    if (recordIdFromUrl) {
      sessionStorage.setItem("salesforceRecordId", recordIdFromUrl)
      sessionStorage.setItem("isSalesforceEmbed", "true")
    }

    // Check if embedded in Salesforce
    const sfEmbed = sessionStorage.getItem("isSalesforceEmbed")
    setIsSalesforceEmbed(sfEmbed === "true")

    // Get Salesforce record ID from the URL, falling back to the existing session value.
    const recordId = recordIdFromUrl || sessionStorage.getItem("salesforceRecordId")
    setSalesforceRecordId(recordId)
  }, [])

  // Configuration
  const GOOGLE_SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || "1kiFc_WM0Yxv8SiyDVbK0SpgwkGyHhAsbM5kKozJXrpg"

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    if (files.length === 0) return

    const file = files[0]

    if (file.type !== "application/pdf") {
      setStatusMessage({ type: "error", message: "Please upload a PDF file only." })
      return
    }

    setSelectedFile(file)
    setStatusMessage(null)
    setShowResult(false)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1])
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProgress(0)
    setStatusMessage(null)

    try {
      const recordId =
        new URLSearchParams(window.location.search).get("recordId") ||
        sessionStorage.getItem("salesforceRecordId") ||
        salesforceRecordId

      if (recordId) {
        sessionStorage.setItem("salesforceRecordId", recordId)
        setSalesforceRecordId(recordId)
      }

      const isSalesforceFlow = sessionStorage.getItem("isSalesforceEmbed") === "true" || Boolean(recordId)
      if (isSalesforceFlow && !recordId) {
        throw new Error("Salesforce record ID is missing. Please reopen the app from Salesforce.")
      }

      const base64 = await fileToBase64(selectedFile)
      setProgress(30)

      console.log("[v0] Sending PDF extraction request with recordId:", recordId)
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileData: base64,
          mimeType: selectedFile.type,
          timestamp: new Date().toISOString(),
          recordId,
        }),
      })

      setProgress(70)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(`n8n error ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      setProgress(100)

      setTimeout(() => {
        setIsProcessing(false)
        setShowResult(true)
        setSheetUrl(`https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}`)
        setStatusMessage({ type: "success", message: "PDF processed successfully!" })
      }, 500)

    } catch (error) {
      console.error("[DocSense] Error:", error)
      setIsProcessing(false)
      setProgress(0)
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to process PDF.",
      })
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setStatusMessage(null)
  }

  const handleNewUpload = () => {
    setSelectedFile(null)
    setShowResult(false)
    setStatusMessage(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated")
    router.push("/login")
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

      {/* Only show logout button when NOT embedded in Salesforce */}
      {!isSalesforceEmbed && (
        <button
          onClick={handleLogout}
          className="fixed top-4 sm:top-6 right-4 sm:right-6 px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-200 border border-white/30 hover:border-white/50"
        >
          Logout
        </button>
      )}

      <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] px-6 sm:px-10 py-8 sm:py-12 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)] animate-pulse" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-white mb-2">DocSense AI</h1>
            <p className="text-white/90 text-sm sm:text-base">Upload your PDF to extract data</p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-16 text-center cursor-pointer transition-all duration-300 overflow-hidden ${isDragging
                ? "border-[#3b82f6] bg-blue-50 border-solid"
                : "border-gray-300 bg-gray-50 hover:border-[#3b82f6] hover:bg-blue-50/50 hover:-translate-y-0.5"
              }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />

            <div
              className={`w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-5 bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] rounded-full flex items-center justify-center transition-transform duration-300 ${isDragging ? "scale-110 rotate-3" : "hover:scale-110 hover:rotate-6"
                }`}
            >
              <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Drop your PDF here</h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-3">or click to browse files</p>
            <p className="text-xs font-medium text-gray-500">Supports: PDF files only</p>

            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          </div>

          {/* File Info */}
          {selectedFile && !showResult && (
            <div className="mt-6 p-4 sm:p-5 bg-gray-50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate text-sm sm:text-base">{selectedFile.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{formatFileSize(selectedFile.size)}</div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedFile && !showResult && (
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full mt-6 h-12 sm:h-14 text-sm sm:text-base font-semibold bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Extract Data"
                )}
              </span>
            </Button>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="mt-6 animate-in fade-in duration-300">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                </div>
              </div>
              <div className="text-center mt-3 text-xs sm:text-sm text-gray-600">Processing...</div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && !showResult && (
            <div
              className={`mt-6 p-4 rounded-xl border animate-in fade-in duration-300 text-sm sm:text-base ${statusMessage.type === "success"
                  ? "bg-green-50 border-green-500 text-green-800"
                  : "bg-red-50 border-red-500 text-red-800"
                }`}
            >
              <span className="text-xl mr-2">{statusMessage.type === "success" ? "✓" : "✕"}</span>
              {statusMessage.message}
            </div>
          )}

          {/* Result Section */}
          {showResult && (
            <div className="mt-8 p-4 sm:p-6 bg-gray-50 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="text-base sm:text-lg font-semibold text-gray-900">Extraction Complete!</div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Your data has been extracted and saved to Google Sheets.
              </p>
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg text-[#3b82f6] font-medium hover:border-[#3b82f6] hover:bg-blue-50/50 transition-all duration-200 hover:translate-x-1 group text-sm sm:text-base"
              >
                <span>View Google Sheet</span>
                <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
              <button
                onClick={handleNewUpload}
                className="w-full mt-4 px-4 py-3 bg-white text-[#3b82f6] border-2 border-[#3b82f6] rounded-lg text-sm font-semibold hover:bg-[#3b82f6] hover:text-white transition-all duration-200"
              >
                Upload Another PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
