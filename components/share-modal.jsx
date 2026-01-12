'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Link2, Copy, Check, MessageCircle, AlertCircle } from 'lucide-react'

export function ShareModal({ text, size, color, bgColor, disabled }) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const generateShareableLink = () => {
    if (!text) return ''

    const qrData = {
      text,
      size,
      color,
      bgColor
    }

    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(qrData)))
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      return `${baseUrl}/share?data=${encoded}`
    } catch (e) {
      setError('Failed to generate shareable link')
      return ''
    }
  }

  const shareableLink = generateShareableLink()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink)
      setCopied(true)
      setError(null)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      setError('Failed to copy to clipboard')
    }
  }

  const shareViaWhatsApp = () => {
    if (!shareableLink) {
      setError('No link to share')
      return
    }

    const message = encodeURIComponent(`Check out this QR Code: ${shareableLink}`)
    const whatsappUrl = `https://wa.me/?text=${message}`

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const shareViaNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR Code',
          url: shareableLink
        })
        setError(null)
      } catch (e) {
        if (e.name !== 'AbortError') {
          setError('Failed to share')
        }
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share QR Code</DialogTitle>
          <DialogDescription>
            Share your QR code via public link or directly through WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-link" className="text-sm font-medium">
              Public Link
            </Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="share-link"
                  value={shareableLink}
                  readOnly
                  className="pl-10 pr-4 text-sm"
                />
              </div>
              <Button
                type="button"
                size="icon"
                onClick={copyToClipboard}
                className="flex-shrink-0"
                variant="outline"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Anyone with this link can view and download the QR code.
            </p>
          </div>

          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3 block">Share via</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={shareViaWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>

              {typeof navigator !== 'undefined' && navigator.share && (
                <Button
                  type="button"
                  onClick={shareViaNativeShare}
                  variant="outline"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  More Options
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
