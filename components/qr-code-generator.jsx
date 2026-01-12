'use client'

import { useState, useEffect } from 'react'
import ReactQRCode from 'react-qr-code'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, Share2, Link, Maximize2, Copy, Check, MessageCircle, ExternalLink } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function QRCodeGenerator() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [color, setColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState(null)

  useEffect(() => {
    document.body.style.backgroundColor = '#f0f0f0'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  const generateShareUrl = () => {
    if (!text) return null

    try {
      const qrData = {
        text,
        size,
        color,
        bgColor
      }
      const encodedData = btoa(encodeURIComponent(JSON.stringify(qrData)))
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      return baseUrl + '/share?data=' + encodedData
    } catch (error) {
      console.error('Error generating share URL:', error)
      return null
    }
  }

  const copyShareLink = async () => {
    const shareUrl = generateShareUrl()
    if (!shareUrl) {
      setShareError('Please enter text or URL first')
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setShareError(null)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      setShareError('Failed to copy link. Please try again.')
      console.error('Copy error:', error)
    }
  }

  const shareViaWhatsApp = () => {
    const shareUrl = generateShareUrl()
    if (!shareUrl) {
      setShareError('Please enter text or URL first')
      return
    }

    try {
      const message = encodeURIComponent('Check out this QR Code: ' + shareUrl)
      const whatsappUrl = 'https://wa.me/?text=' + message
      window.open(whatsappUrl, '_blank')
      setShareError(null)
    } catch (error) {
      setShareError('Failed to open WhatsApp. Please try again.')
      console.error('WhatsApp share error:', error)
    }
  }

  const openShareLink = () => {
    const shareUrl = generateShareUrl()
    if (!shareUrl) {
      setShareError('Please enter text or URL first')
      return
    }

    window.open(shareUrl, '_blank')
    setShareError(null)
  }

  const downloadQRCode = () => {
    const qrCodeElement = document.getElementById('qr-code-svg')
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

  const shareQRCode = () => {
    if (!text) {
      setShareError('Please enter text or URL first')
      return
    }
    setShareError(null)
    setShareDialogOpen(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-5xl mx-auto overflow-hidden shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col justify-center items-center p-4 bg-gray-50 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">QR Code Generator</h2>
              {text && (
                <div id="qr-code-svg" className="transition-all duration-300 ease-in-out hover:scale-105">
                  <ReactQRCode
                    value={text}
                    size={size}
                    fgColor={color}
                    bgColor={bgColor}
                    style={{ width: size + 'px', height: size + 'px' }}
                  />
                </div>
              )}
              {shareError && !shareDialogOpen && (
                <p className="text-sm text-red-500 mt-2">{shareError}</p>
              )}
              <div className="mt-4 flex gap-4">
                <Button onClick={downloadQRCode} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Download className="mr-2 h-4 w-4" /> Download PNG
                </Button>
                <Button onClick={shareQRCode} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="text-input" className="text-sm font-medium text-gray-700">Text or URL</Label>
                <div className="relative">
                  <Input
                    id="text-input"
                    type="text"
                    placeholder="Enter text or URL"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size-slider" className="text-sm font-medium text-gray-700">Size: {size}x{size}</Label>
                <div className="flex items-center space-x-2">
                  <Maximize2 size={18} className="text-gray-400" />
                  <Slider
                    id="size-slider"
                    min={128}
                    max={300}
                    step={8}
                    value={[size]}
                    onValueChange={(value) => setSize(value[0])}
                    className="flex-grow"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="color-input" className="text-sm font-medium text-gray-700">QR Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color-input"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-10 p-1 rounded-md cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-grow"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-color-input" className="text-sm font-medium text-gray-700">Background Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="bg-color-input"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 p-1 rounded-md cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-grow"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share QR Code</DialogTitle>
            <DialogDescription>
              Share your QR code via a public link or directly on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {shareError && (
              <p className="text-sm text-red-500 text-center">{shareError}</p>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Public Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={generateShareUrl() || ''}
                  className="flex-1 text-sm"
                  placeholder="Generate QR code first"
                />
                <Button
                  onClick={copyShareLink}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-600">Link copied to clipboard!</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={openShareLink}
                variant="outline"
                className="w-full justify-start"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Public Link
              </Button>

              <Button
                onClick={shareViaWhatsApp}
                className="w-full justify-start bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Share via WhatsApp
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-2">
              The public link allows anyone to view and download this QR code without authentication.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
