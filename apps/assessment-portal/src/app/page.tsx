"use client"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [submitted, setSubmitted] = useState(false)
  useEffect(() => {
    try {
      const v = sessionStorage.getItem('assessmentSubmitted')
      if (v === '1') setSubmitted(true)
      // clear flag to avoid confusion on future sessions
      sessionStorage.removeItem('assessmentSubmitted')
    } catch {}
  }, [])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {submitted ? (
          <div className="bg-card rounded-lg shadow-lg border p-8 text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Success!</h2>
            <p className="text-muted-foreground text-lg">Assessment successfully submitted.</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-lg border p-8 text-center">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📝</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Assessment Portal</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Welcome! Use your provided assessment link to access and complete your questions.
            </p>
            <div className="mt-6 p-4 bg-muted rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Make sure you have a stable internet connection before starting your assessment.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
