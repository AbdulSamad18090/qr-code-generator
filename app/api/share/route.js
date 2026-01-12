import { NextResponse } from 'next/server'
import { saveQRCode, generateId } from '@/lib/qr-store'

export async function POST(request) {
  try {
    const body = await request.json()
    const { text, size, color, bgColor } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required to generate a QR code' },
        { status: 400 }
      )
    }

    const id = generateId()

    saveQRCode(id, {
      text,
      size: size || 256,
      color: color || '#000000',
      bgColor: bgColor || '#ffffff',
    })

    return NextResponse.json({
      success: true,
      id,
      message: 'QR code saved successfully'
    })
  } catch (error) {
    console.error('Error saving QR code:', error)
    return NextResponse.json(
      { error: 'Failed to save QR code' },
      { status: 500 }
    )
  }
}
