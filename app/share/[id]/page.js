'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactQRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, AlertCircle, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function SharePage() {
  const params = useParams()
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchQRCode() {
      try {
        const response = await fetch(`/api/qr/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('This QR code link has expired or does not exist.')
          } else {
            setError('Failed to load QR code. Please try again.')
          }
          return
        }
        const data = await response.json()
        setQrData(data)
      } catch (err) {
        setError('Failed to load QR code. Please check your connection.')
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
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-4 text-gray-600">Loading QR Code...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-800">QR Code Not Found</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <Button
              onClick={() => window.location.href = '/'}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create Your Own QR Code
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Shared QR Code</h2>
          <div className="flex justify-center">
            <div
              id="shared-qr-code"
              className="p-4 rounded-lg"
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
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-4 break-all">
              Content: {qrData.text}
            </p>
            <Button
              onClick={downloadQRCode}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Download className="mr-2 h-4 w-4" /> Download PNG
            </Button>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Create your own QR Code
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
