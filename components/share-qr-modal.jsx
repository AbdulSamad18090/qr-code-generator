'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Link, Copy, Check, MessageCircle, Share2, AlertCircle } from 'lucide-react'

export default function ShareQRModal({ isOpen, onClose, qrData }) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [error, setError] = useState(null)
  const [isSharing, setIsSharing] = useState(false)
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen && qrData?.text) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const params = new URLSearchParams({
        text: qrData.text,
        size: qrData.size?.toString() || '256',
        color: qrData.color || '#000000',
        bgColor: qrData.bgColor || '#ffffff'
      })
      setShareUrl(`${baseUrl}/share?${params.toString()}`)
    }
  }, [isOpen, qrData])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const copyToClipboard = async () => {
    setError(null)
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy link. Please copy it manually.')
      console.error('Copy failed:', err)
    }
  }

  const shareViaWhatsApp = () => {
    setError(null)
    try {
      const message = encodeURIComponent(`Check out this QR Code: ${shareUrl}`)
      const whatsappUrl = `https://wa.me/?text=${message}`
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError('Failed to open WhatsApp. Please try again.')
      console.error('WhatsApp share failed:', err)
    }
  }

  const shareViaNativeShare = async () => {
    setError(null)
    setIsSharing(true)

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR Code',
          url: shareUrl
        })
      } else {
        setError('Native sharing is not supported on this device. Use copy link or WhatsApp instead.')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to share. Please try another sharing option.')
        console.error('Native share failed:', err)
      }
    } finally {
      setIsSharing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card ref={modalRef} className="w-full max-w-md mx-auto overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Share QR Code</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Link className="h-4 w-4" /> Public Link
              </label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-sm bg-gray-50"
                  onClick={(e) => e.target.select()}
                />
                <Button
                  onClick={copyToClipboard}
                  className={`${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white min-w-[100px]`}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Anyone with this link can view and download the QR code
              </p>
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Share directly
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={shareViaWhatsApp}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </Button>
                <Button
                  onClick={shareViaNativeShare}
                  disabled={isSharing}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {isSharing ? 'Sharing...' : 'More Options'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
