'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactQRCode from 'react-qr-code'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Home, AlertCircle } from 'lucide-react'
import html2canvas from 'html2canvas'
import Link from 'next/link'

function SharePageContent() {
  const searchParams = useSearchParams()
  const [qrData, setQrData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const data = searchParams.get('data')
      if (data) {
        const decoded = JSON.parse(decodeURIComponent(atob(data)))
        setQrData(decoded)
      } else {
        setError('No QR code data provided')
      }
    } catch (e) {
      setError('Invalid QR code data')
    }
  }, [searchParams])

  const downloadQRCode = () => {
    const qrCodeElement = document.getElementById('shared-qr-code')
    if (!qrCodeElement) return

    html2canvas(qrCodeElement).then(canvas => {
      const image = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = image
      downloadLink.download = 'qrcode.png'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    })
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Home className="mr-2 h-4 w-4" /> Go to Generator
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!qrData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">
              <div className="w-48 h-48 bg-gray-200 mx-auto mb-4 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Shared QR Code</h2>

          <div className="flex flex-col items-center">
            <div
              id="shared-qr-code"
              className="p-4 rounded-lg mb-4"
              style={{ backgroundColor: qrData.bgColor || '#ffffff' }}
            >
              <ReactQRCode
                value={qrData.text}
                size={qrData.size || 256}
                fgColor={qrData.color || '#000000'}
                bgColor={qrData.bgColor || '#ffffff'}
                style={{ width: `${qrData.size || 256}px`, height: `${qrData.size || 256}px` }}
              />
            </div>

            <p className="text-sm text-gray-600 mb-4 text-center break-all px-4">
              <span className="font-medium">Content:</span> {qrData.text}
            </p>

            <div className="flex gap-3">
              <Button onClick={downloadQRCode} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Download className="mr-2 h-4 w-4" /> Download PNG
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" /> Create Your Own
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">
              <div className="w-48 h-48 bg-gray-200 mx-auto mb-4 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <SharePageContent />
    </Suspense>
  )
}
