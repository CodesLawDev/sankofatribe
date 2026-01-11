/**
 * Mailchimp Integration Utilities
 * Handles newsletter subscription management with Mailchimp API
 */

export interface MailchimpContact {
    email_address: string
    status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending'
    merge_fields?: {
        FNAME?: string
        LNAME?: string
        PHONE?: string
    }
    tags?: string[]
}

export interface MailchimpResponse {
    id: string
    email_address: string
    status: string
    merge_fields?: Record<string, string>
}

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID
const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER // e.g., 'us1', 'us2', etc.

if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER) {
    console.warn('⚠️  Mailchimp environment variables not configured')
}

/**
 * Get Mailchimp API endpoint
 */
function getMailchimpEndpoint(): string {
    return `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0`
}

/**
 * Get authorization header for Mailchimp API
 */
function getAuthHeader(): {
    'Authorization': string
    'Content-Type': string
} {
    const auth = Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')
    return {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
    }
}

/**
 * Subscribe or update contact in Mailchimp
 */
export async function subscribeToMailchimp(
    contact: MailchimpContact,
    options?: { tags?: string[] }
): Promise<MailchimpResponse | null> {
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER) {
        console.warn('Mailchimp not configured, skipping subscription')
        return null
    }

    try {
        const endpoint = getMailchimpEndpoint()
        const subscriberHash = md5(contact.email_address.toLowerCase())

        const payload = {
            email_address: contact.email_address,
            status: 'subscribed',
            status_if_new: 'pending', // Double opt-in
            merge_fields: {
                FNAME: contact.merge_fields?.FNAME || '',
                LNAME: contact.merge_fields?.LNAME || '',
                PHONE: contact.merge_fields?.PHONE || '',
            },
            tags: options?.tags || ['Website Signup'],
        }

        const response = await fetch(
            `${endpoint}/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`,
            {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(payload),
            }
        )

        if (!response.ok) {
            const error = await response.json()
            console.error('Mailchimp subscription error:', error)
            throw new Error(`Mailchimp API error: ${error.detail || response.statusText}`)
        }

        const data = await response.json()
        console.log('✅ Subscribed to Mailchimp:', data.email_address)
        return data
    } catch (error) {
        console.error('Error subscribing to Mailchimp:', error)
        throw error
    }
}

/**
 * Unsubscribe from Mailchimp
 */
export async function unsubscribeFromMailchimp(email: string): Promise<void> {
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER) {
        return
    }

    try {
        const endpoint = getMailchimpEndpoint()
        const subscriberHash = md5(email.toLowerCase())

        const response = await fetch(
            `${endpoint}/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`,
            {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ status: 'unsubscribed' }),
            }
        )

        if (!response.ok) {
            throw new Error(`Failed to unsubscribe: ${response.statusText}`)
        }

        console.log('✅ Unsubscribed from Mailchimp:', email)
    } catch (error) {
        console.error('Error unsubscribing from Mailchimp:', error)
        throw error
    }
}

/**
 * Add tags to a Mailchimp subscriber
 */
export async function addTagsToMailchimp(email: string, tags: string[]): Promise<void> {
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER) {
        return
    }

    try {
        const endpoint = getMailchimpEndpoint()
        const subscriberHash = md5(email.toLowerCase())

        const payload = {
            tags: tags.map((tag) => ({
                name: tag,
                status: 'active',
            })),
        }

        const response = await fetch(
            `${endpoint}/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}/tags`,
            {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(payload),
            }
        )

        if (!response.ok) {
            throw new Error(`Failed to add tags: ${response.statusText}`)
        }

        console.log('✅ Added tags to Mailchimp subscriber:', email, tags)
    } catch (error) {
        console.error('Error adding tags to Mailchimp:', error)
        throw error
    }
}

/**
 * Get subscriber info from Mailchimp
 */
export async function getMailchimpSubscriber(email: string): Promise<MailchimpResponse | null> {
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER) {
        return null
    }

    try {
        const endpoint = getMailchimpEndpoint()
        const subscriberHash = md5(email.toLowerCase())

        const response = await fetch(
            `${endpoint}/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`,
            {
                method: 'GET',
                headers: getAuthHeader(),
            }
        )

        if (response.status === 404) {
            return null
        }

        if (!response.ok) {
            throw new Error(`Failed to get subscriber: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error getting Mailchimp subscriber:', error)
        return null
    }
}

/**
 * Simple MD5 implementation for Mailchimp subscriber hash
 * Mailchimp requires lowercase MD5 hash of email
 */
function md5(str: string): string {
    const crypto = require('crypto')
    return crypto.createHash('md5').update(str).digest('hex')
}
