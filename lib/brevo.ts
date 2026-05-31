const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = process.env.BREVO_LIST_ID ? parseInt(process.env.BREVO_LIST_ID, 10) : undefined

function getAuthHeader() {
    return {
        'api-key': BREVO_API_KEY || '',
        'Content-Type': 'application/json',
    }
}

export async function subscribeToBrevo(email: string, firstName?: string, lastName?: string, phone?: string) {
    if (!BREVO_API_KEY) {
        console.warn('⚠️  Brevo API key not set, skipping newsletter subscription for', email)
        return { id: 'mock-id-no-key' }
    }

    if (!BREVO_LIST_ID) {
        console.warn('⚠️  Brevo List ID not set, skipping newsletter subscription')
        return null
    }

    const attributes: Record<string, string> = {}
    if (firstName) attributes.FIRSTNAME = firstName
    if (lastName) attributes.LASTNAME = lastName
    if (phone) attributes.SMS = phone // Note: Brevo requires E.164 format for SMS

    try {
        const payload = {
            email,
            attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
            listIds: [BREVO_LIST_ID],
            updateEnabled: true, // Update if contact already exists
        }

        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorText = await response.text()
            // If contact already exists and updateEnabled didn't work (rare but possible depending on Brevo state)
            if (response.status === 400 && errorText.includes('duplicate_parameter')) {
                console.log('Contact already exists in Brevo:', email)
                return await getBrevoContact(email)
            }
            throw new Error(`Brevo API error: ${response.statusText} - ${errorText}`)
        }

        const data = await response.json()
        console.log('✅ Successfully synced contact to Brevo:', email)
        return {
            id: String(data.id),
        }
    } catch (error) {
        console.error('Error subscribing to Brevo:', error)
        return null
    }
}

export async function getBrevoContact(email: string) {
    if (!BREVO_API_KEY) return null

    try {
        const encodedEmail = encodeURIComponent(email)
        const response = await fetch(`https://api.brevo.com/v3/contacts/${encodedEmail}`, {
            method: 'GET',
            headers: getAuthHeader(),
        })

        if (!response.ok) {
            if (response.status === 404) return null // Contact doesn't exist
            throw new Error(`Failed to get Brevo subscriber: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            id: String(data.id),
            email: data.email
        }
    } catch (error) {
        console.error('Error getting Brevo subscriber:', error)
        return null
    }
}

// Ensure a contact attribute exists in Brevo (idempotent). Brevo rejects
// updates that reference an unknown attribute, so we create it first.
async function ensureBrevoAttribute(name: string, type: 'text' | 'boolean' | 'date') {
    try {
        const res = await fetch(
            `https://api.brevo.com/v3/contacts/attributes/normal/${encodeURIComponent(name)}`,
            { method: 'POST', headers: getAuthHeader(), body: JSON.stringify({ type }) }
        )
        // 201 = created, 400 with "already exists" = fine
        if (!res.ok && res.status !== 400) {
            console.warn(`Brevo: could not ensure attribute ${name}:`, res.statusText)
        }
    } catch (e) {
        console.warn(`Brevo: ensureAttribute(${name}) failed:`, e)
    }
}

/**
 * Stamp a contact as having redeemed a promo code so marketing segments reflect
 * it. Best-effort: never throws, so it can't break order fulfilment.
 */
export async function markPromoRedeemedInBrevo(email: string, code: string) {
    if (!BREVO_API_KEY) return false
    try {
        await Promise.all([
            ensureBrevoAttribute('WELCOME_CODE_USED', 'boolean'),
            ensureBrevoAttribute('LAST_PROMO_CODE', 'text'),
            ensureBrevoAttribute('LAST_PROMO_USED_AT', 'date'),
        ])

        const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({
                attributes: {
                    WELCOME_CODE_USED: true,
                    LAST_PROMO_CODE: code.toUpperCase(),
                    LAST_PROMO_USED_AT: new Date().toISOString().split('T')[0],
                },
            }),
        })

        if (!res.ok && res.status !== 404) {
            console.warn('Brevo: promo write-back failed:', res.statusText)
            return false
        }
        return res.ok
    } catch (e) {
        console.error('Brevo: markPromoRedeemed error:', e)
        return false
    }
}

export async function sendBrevoEmail({
    to,
    subject,
    htmlContent,
    senderName = 'Sankofa Tribe',
    senderEmail = 'hello@sankofatribe.com',
}: {
    to: { email: string; name?: string }[]
    subject: string
    htmlContent: string
    senderName?: string
    senderEmail?: string
}) {
    if (!BREVO_API_KEY) {
        console.warn('⚠️  Brevo API key not set, skipping email send to', to)
        return false
    }

    try {
        const payload = {
            sender: { name: senderName, email: senderEmail },
            to,
            subject,
            htmlContent,
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Brevo API error: ${response.statusText} - ${errorText}`)
        }

        const data = await response.json()
        console.log('✅ Sent email via Brevo. Message ID:', data.messageId)
        return true
    } catch (error) {
        console.error('Error sending Brevo email:', error)
        return false
    }
}
