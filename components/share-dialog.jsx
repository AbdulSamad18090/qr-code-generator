'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { X, Copy, Check, Loader2, Link2, AlertCircle } from 'lucide-react'

export default function ShareDialog({ isOpen, onClose, qrData }) {
  const [shareUrl, setShareUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const generateShareLink = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qrData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await response.json()
      setShareUrl(data.shareUrl)
    } catch (err) {
      setError('Failed to generate share link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  const shareViaWhatsApp = () => {
    const message = shareUrl
      ? `Check out this QR Code: ${shareUrl}`
      : `Check out this QR Code: ${qrData.text}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleClose = () => {
    setShareUrl('')
    setError('')
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      <Card className="relative z-10 w-full max-w-md mx-4 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Share QR Code</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Public Share Link
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={shareUrl}
                  readOnly
                  placeholder="Click generate to create a share link"
                  className="flex-grow"
                />
                {shareUrl ? (
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={generateShareLink}
                    disabled={loading}
                    className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              {shareUrl && (
                <p className="text-xs text-gray-500">
                  Anyone with this link can view and download the QR code.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Share directly via
              </Label>
              <div className="flex gap-3">
                <Button
                  onClick={shareViaWhatsApp}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
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
                    onClick={async () => {
                      try {
                        await navigator.share({
                          title: 'QR Code',
                          text: 'Check out this QR Code',
                          url: shareUrl || qrData.text,
                        })
                      } catch (err) {
                        if (err.name !== 'AbortError') {
                          setError('Failed to share')
                        }
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    More Options
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
