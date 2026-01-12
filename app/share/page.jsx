'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import ReactQRCode from 'react-qr-code'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, ArrowLeft } from 'lucide-react'
import html2canvas from 'html2canvas'
import Link from 'next/link'

function SharePageContent() {
  const searchParams = useSearchParams()
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  const text = searchParams.get('text') || ''
  const size = parseInt(searchParams.get('size') || '256', 10)
  const color = searchParams.get('color') || '#000000'
  const bgColor = searchParams.get('bgColor') || '#ffffff'

  const downloadQRCode = async () => {
    setDownloading(true)
    setError(null)

    try {
      const qrCodeElement = document.getElementById('shared-qr-code')
      if (!qrCodeElement) {
        throw new Error('QR code element not found')
      }

      const canvas = await html2canvas(qrCodeElement)
      const image = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = image
      downloadLink.download = 'qrcode.png'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (err) {
      setError('Failed to download QR code. Please try again.')
      console.error('Download error:', err)
    } finally {
      setDownloading(false)
    }
  }

  if (!text) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid QR Code Link</h1>
            <p className="text-gray-600 mb-6">This QR code link is invalid or has expired.</p>
            <Link href="/">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Create New QR Code
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Shared QR Code</h1>

          <div className="flex flex-col items-center">
            <div
              id="shared-qr-code"
              className="p-4 rounded-lg transition-all duration-300 ease-in-out"
              style={{ backgroundColor: bgColor }}
            >
              <ReactQRCode
                value={text}
                size={Math.min(size, 256)}
                fgColor={color}
                bgColor={bgColor}
                style={{ width: `${Math.min(size, 256)}px`, height: `${Math.min(size, 256)}px` }}
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={downloadQRCode}
                disabled={downloading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? 'Downloading...' : 'Download PNG'}
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-gray-500 hover:bg-gray-600 text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Create New
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500 text-center">
              Scan this QR code to access: <span className="font-medium break-all">{text.length > 50 ? text.substring(0, 50) + '...' : text}</span>
            </p>
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
              <div className="h-64 w-64 mx-auto bg-gray-200 rounded-lg mb-4"></div>
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
