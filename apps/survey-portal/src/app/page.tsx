"use client"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [submitted, setSubmitted] = useState(false)
  useEffect(() => {
    try {
      const v = sessionStorage.getItem('surveySubmitted')
      if (v === '1') setSubmitted(true)
      // clear flag to avoid confusion on future sessions
      sessionStorage.removeItem('surveySubmitted')
    } catch {}
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      {submitted ? (
        <p className="text-green-600 text-base">Survey successfully answered.</p>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Survey Portal</h1>
          <p className="text-gray-600">Use the provided survey link to answer questions.</p>
        </div>
      )}
    </main>
  )
}


