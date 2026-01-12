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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Share2, Link, Maximize2, Copy, Check, AlertCircle, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'

// WhatsApp icon component
const WhatsAppIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function QRCodeGenerator() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [color, setColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [publicLink, setPublicLink] = useState('')
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [shareError, setShareError] = useState('')

  useEffect(() => {
    document.body.style.backgroundColor = '#f0f0f0'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

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

  const generatePublicLink = async () => {
    if (!text) {
      setShareError('Please enter text or URL to generate a QR code first')
      return
    }

    setIsGeneratingLink(true)
    setShareError('')
    setLinkCopied(false)

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          size,
          color,
          bgColor,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setShareError(data.error || 'Failed to generate shareable link')
        return
      }

      const baseUrl = window.location.origin
      const shareUrl = `${baseUrl}/share/${data.id}`
      setPublicLink(shareUrl)
    } catch (error) {
      setShareError('Failed to generate shareable link. Please try again.')
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      setShareError('Failed to copy link to clipboard')
    }
  }

  const shareViaWhatsApp = () => {
    if (!publicLink) {
      setShareError('Please generate a public link first')
      return
    }

    const message = encodeURIComponent(`Check out this QR Code: ${publicLink}`)
    const whatsappUrl = `https://wa.me/?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const shareViaNativeShare = async () => {
    if (!publicLink) {
      setShareError('Please generate a public link first')
      return
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR Code',
          url: publicLink,
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          setShareError('Failed to share. Please try copying the link instead.')
        }
      }
    } else {
      copyToClipboard()
    }
  }

  const handleShareDialogOpen = (open) => {
    setShareDialogOpen(open)
    if (open) {
      setPublicLink('')
      setShareError('')
      setLinkCopied(false)
    }
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
                    style={{ width: `${size}px`, height: `${size}px` }}
                  />
                </div>
              )}
              <div className="mt-4 flex gap-4">
                <Button onClick={downloadQRCode} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Download className="mr-2 h-4 w-4" /> Download PNG
                </Button>
                <Dialog open={shareDialogOpen} onOpenChange={handleShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share QR Code</DialogTitle>
                      <DialogDescription>
                        Generate a public link to share your QR code with anyone.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      {shareError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <p className="text-sm">{shareError}</p>
                        </div>
                      )}

                      {!publicLink ? (
                        <Button
                          onClick={generatePublicLink}
                          disabled={isGeneratingLink || !text}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          {isGeneratingLink ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Link className="mr-2 h-4 w-4" />
                              Generate Public Link
                            </>
                          )}
                        </Button>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Public Link</Label>
                            <div className="flex gap-2">
                              <Input
                                value={publicLink}
                                readOnly
                                className="flex-1 text-sm"
                              />
                              <Button
                                onClick={copyToClipboard}
                                variant="outline"
                                size="icon"
                                className="flex-shrink-0"
                              >
                                {linkCopied ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {linkCopied && (
                              <p className="text-sm text-green-600">Link copied to clipboard!</p>
                            )}
                          </div>

                          <div className="pt-4 space-y-3">
                            <p className="text-sm font-medium text-gray-700">Share via</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button
                                onClick={shareViaWhatsApp}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                              >
                                <WhatsAppIcon className="mr-2 h-4 w-4" />
                                WhatsApp
                              </Button>
                              <Button
                                onClick={shareViaNativeShare}
                                variant="outline"
                                className="flex-1"
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                More Options
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      {!text && !shareError && (
                        <p className="text-sm text-gray-500 text-center">
                          Enter text or URL to create a QR code first.
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
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
    </div>
  )
}
