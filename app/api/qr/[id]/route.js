import { NextResponse } from 'next/server'
import { getQRCode } from '@/lib/qr-store'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const qrData = getQRCode(id)

    if (!qrData) {
      return NextResponse.json(
        { error: 'QR code not found or has expired' },
        { status: 404 }
      )
    }

    return NextResponse.json(qrData)
  } catch (error) {
    console.error('Error fetching QR code:', error)
    return NextResponse.json(
      { error: 'Failed to fetch QR code' },
      { status: 500 }
    )
  }
}
