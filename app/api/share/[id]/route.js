import { NextResponse } from 'next/server'
import { getQRCode, deleteQRCode } from '@/lib/qr-store'

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

    return NextResponse.json({
      success: true,
      data: qrData
    })
  } catch (error) {
    console.error('Error retrieving QR code:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve QR code' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const deleted = deleteQRCode(id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'QR code deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting QR code:', error)
    return NextResponse.json(
      { error: 'Failed to delete QR code' },
      { status: 500 }
    )
  }
}
