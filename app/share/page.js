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

  // Get QR code parameters from URL
  const encodedData = searchParams.get('data')

  if (!encodedData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Invalid Share Link</h2>
            <p className="text-gray-600 mb-4">This share link is invalid or has expired.</p>
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

  let qrData
  try {
    qrData = JSON.parse(decodeURIComponent(atob(encodedData)))
  } catch (e) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Invalid Share Link</h2>
            <p className="text-gray-600 mb-4">This share link is invalid or corrupted.</p>
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

  const { text, size = 256, color = '#000000', bgColor = '#ffffff' } = qrData

  const downloadQRCode = async () => {
    setDownloading(true)
    setError(null)

    try {
      const qrCodeElement = document.getElementById('shared-qr-code')
      if (!qrCodeElement) {
        setError('Could not find QR code element')
        return
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Shared QR Code</h2>

          <div className="flex flex-col items-center">
            <div
              id="shared-qr-code"
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: bgColor }}
            >
              <ReactQRCode
                value={text}
                size={Math.min(size, 256)}
                fgColor={color}
                bgColor={bgColor}
              />
            </div>

            <p className="text-sm text-gray-600 mb-4 text-center break-all max-w-full">
              Content: {text.length > 100 ? text.substring(0, 100) + '...' : text}
            </p>

            {error && (
              <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={downloadQRCode}
                disabled={downloading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? 'Downloading...' : 'Download PNG'}
              </Button>

              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-100">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Create Your Own
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
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Loading shared QR code...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <SharePageContent />
    </Suspense>
  )
}
