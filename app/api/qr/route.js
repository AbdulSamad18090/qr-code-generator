import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { saveQRCode } from '@/lib/qr-store'

export async function POST(request) {
  try {
    const body = await request.json()
    const { text, size, color, bgColor } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const id = nanoid(10)

    saveQRCode(id, {
      text,
      size: size || 256,
      color: color || '#000000',
      bgColor: bgColor || '#ffffff',
    })

    const shareUrl = `${request.headers.get('origin') || ''}/share/${id}`

    return NextResponse.json({
      id,
      shareUrl,
    })
  } catch (error) {
    console.error('Error creating shareable QR code:', error)
    return NextResponse.json(
      { error: 'Failed to create shareable link' },
      { status: 500 }
    )
  }
}
