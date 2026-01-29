'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactQRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, AlertCircle, Loader2, Share2, Copy, Check } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function SharePage() {
  const params = useParams()
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState('')

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

  const getCurrentShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href
    }
    return ''
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentShareUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setShareError('Failed to copy to clipboard')
      setTimeout(() => setShareError(''), 3000)
    }
  }

  const shareViaWhatsApp = () => {
    const shareUrl = getCurrentShareUrl()
    const message = `Check out this QR Code: ${shareUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const shareViaWebShare = async () => {
    const shareUrl = getCurrentShareUrl()
    try {
      await navigator.share({
        title: 'Shared QR Code',
        text: 'Check out this QR Code',
        url: shareUrl,
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setShareError('Failed to share')
        setTimeout(() => setShareError(''), 3000)
      }
    }
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
            {shareError && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {shareError}
              </div>
            )}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={downloadQRCode}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Download className="mr-2 h-4 w-4" /> Download PNG
              </Button>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="border-gray-300"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              <Button
                onClick={shareViaWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </Button>
              {typeof navigator !== 'undefined' && navigator.share && (
                <Button
                  onClick={shareViaWebShare}
                  variant="outline"
                  className="border-gray-300"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  More Options
                </Button>
              )}
            </div>
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
