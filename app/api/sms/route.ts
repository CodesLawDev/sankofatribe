import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'

const FLASHSMS_BASE_URL = 'https://app.flashsms.africa/api/v1'
const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{adminPhone, senderId}`

type SmsType = 'payment_confirmation' | 'new_order_alert' | 'shipping_notification' | 'delivery_notification' | 'cancellation_notification' | 'low_stock_alert' | 'promotion' | 'order_confirmation' | 'generic'

async function loadSettings() {
    const settings = await serverClient.fetch<{ adminPhone?: string; senderId?: string }>(SETTINGS_QUERY)
    return {
        adminPhone: settings?.adminPhone || '',
        senderId: settings?.senderId || '',
    }
}

function buildMessage(type: SmsType, data: any) {
    const customerName = data.customerName || 'Customer'
    const orderId = data.orderId || ''
    
    switch (type) {
        case 'order_confirmation':
            return `Hi ${customerName}, your order ${orderId} has been confirmed! Total: GH₵${data.amount || data.total || ''}. We'll notify you when it ships. Thank you for choosing SankofaTribe!`
        
        case 'payment_confirmation':
            return `Hi ${customerName}, payment received for order ${orderId}! Amount: GH₵${data.amount || ''} via ${data.paymentMethod || 'Paystack'}. Your order is being processed. Thank you!`
        
        case 'shipping_notification':
            return `Hi ${customerName}, great news! Your order ${orderId} has been shipped. Tracking: ${data.trackingNumber || 'N/A'}. Expected delivery: ${data.estimatedDelivery || '2-3 days'}. Track: sankofatribe.com/track`
        
        case 'delivery_notification':
            return `Hi ${customerName}, your order ${orderId} has been delivered! We hope you love your purchase. Rate your experience: sankofatribe.com/review/${orderId}`
        
        case 'cancellation_notification':
            return `Hi ${customerName}, your order ${orderId} has been cancelled. ${data.refundAmount ? `Refund of GH₵${data.refundAmount} will be processed in 3-5 business days.` : ''} Questions? Contact support.`
        
        case 'new_order_alert':
            return `🔔 New order ${orderId}! Total: GH₵${data.total || ''}. Customer: ${customerName}. Review at sankofatribe.com/admin/orders/${orderId}`
        
        case 'low_stock_alert':
            return `⚠️ Low stock alert: ${data.productName || 'Product'} - Only ${data.currentStock || 0} units left. Restock recommended.`
        
        case 'promotion':
            return data.message || 'Special offer from SankofaTribe! Visit sankofatribe.com to shop now.'
        
        default:
            return data.message || 'Notification from SankofaTribe'
    }
}

export async function POST(req: NextRequest) {
    try {
        // ---- Authentication: internal secret or admin JWT ----
        const internalSecret = process.env.INTERNAL_API_SECRET
        const providedSecret = req.headers.get('x-internal-secret')
        if (!internalSecret || providedSecret !== internalSecret) {
            // Fallback: check for admin JWT in cookie
            const { verifyToken } = await import('@/lib/auth-utils')
            const authToken = req.cookies.get('auth-token')?.value
            const user = authToken ? await verifyToken(authToken) : null
            if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
                return NextResponse.json(
                    { success: false, error: 'Unauthorized' },
                    { status: 401 }
                )
            }
        }

        const apiKey = process.env.FLASHSMS_API_KEY
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'Missing FLASHSMS_API_KEY env var' }, { status: 500 })
        }

        const payload = await req.json()
        const type: SmsType = payload?.type || 'generic'
        const data = payload?.data || {}

        // Load settings once to resolve admin phone and senderId
        const settings = await loadSettings()

        let recipients: string[] = (payload?.recipients as string[]) || []
        if (recipients.length === 0 && type === 'new_order_alert') {
            if (data.adminPhone) {
                recipients = [data.adminPhone]
            } else if (settings.adminPhone) {
                recipients = [settings.adminPhone]
            }
        }
        if (recipients.length === 0 && data.customerPhone) {
            recipients = [data.customerPhone]
        }

        if (!recipients || recipients.length === 0) {
            return NextResponse.json({ success: false, error: 'No recipients provided' }, { status: 400 })
        }

        const message = buildMessage(type, data)
        const senderId = process.env.FLASHSMS_SENDER_ID || data.senderId || settings.senderId || 'Sankofa'

        const response = await fetch(`${FLASHSMS_BASE_URL}/sms/send`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipients,
                message,
                senderId,
                campaignName: payload?.campaignName || undefined,
            }),
        })

        const result = await response.json()

        if (!response.ok || result?.success === false) {
            return NextResponse.json({ success: false, error: result?.error || 'Failed to send SMS' }, { status: response.status || 500 })
        }

        return NextResponse.json({ success: true, data: result?.data })
    } catch (error) {
        console.error('sms endpoint error:', error)
        const message = error instanceof Error ? error.message : 'Failed to send SMS'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
