'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ReactQRCode from 'react-qr-code'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function SharedQRCodePage() {
  const params = useParams()
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch(`/api/share/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to load QR code')
          return
        }

        setQrData(data.data)
      } catch (err) {
        setError('Failed to load QR code. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchQRCode()
    }
  }, [params.id])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600">Loading QR Code...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">QR Code Not Found</h2>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create New QR Code
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-auto overflow-hidden shadow-lg">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Shared QR Code</h2>

          <div className="flex justify-center mb-6">
            <div
              id="shared-qr-code"
              className="p-4 rounded-lg transition-all duration-300 ease-in-out hover:scale-105"
              style={{ backgroundColor: qrData.bgColor }}
            >
              <ReactQRCode
                value={qrData.text}
                size={qrData.size}
                fgColor={qrData.color}
                bgColor={qrData.bgColor}
                style={{ width: `${qrData.size}px`, height: `${qrData.size}px` }}
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">QR Code Content:</p>
            <p className="text-gray-700 break-all bg-gray-50 p-2 rounded">{qrData.text}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={downloadQRCode}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Download className="mr-2 h-4 w-4" /> Download QR Code
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              Create Your Own QR Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
