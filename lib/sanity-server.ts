import { createClient } from 'next-sanity'

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN

export const serverClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    useCdn: false,
    token,
    perspective: 'published',
})

export function assertSanityToken() {
    if (!token) {
        throw new Error('Missing SANITY_WRITE_TOKEN environment variable')
    }
}
/**
 * Validate stock availability for order items
 */
export async function validateOrderStock(items: Array<{ productId: string; quantity: number; selectedSize?: string }>) {
    const errors: string[] = []
    
    try {
        const productIds = items.map(item => item.productId)
        
        const query = `*[_type == "product" && _id in $ids] {
            _id,
            name,
            sizes[] {
                size,
                stock
            },
            inStock
        }`
        
        const products = await serverClient.fetch<Array<{
            _id: string;
            name: string;
            sizes?: Array<{ size: string; stock: number }>;
            inStock?: boolean;
        }>>(query, { ids: productIds })
        const productMap = new Map(products.map((p) => [p._id, p]))
        
        for (const item of items) {
            const product = productMap.get(item.productId)
            
            if (!product) {
                errors.push(`Product not found: ${item.productId}`)
                continue
            }
            
            if (!product.inStock) {
                errors.push(`${product.name} is out of stock`)
                continue
            }
            
            if (item.selectedSize && product.sizes && product.sizes.length > 0) {
                const sizeVariant = product.sizes.find((s: any) => 
                    s.size?.toLowerCase() === item.selectedSize?.toLowerCase()
                )
                
                if (!sizeVariant) {
                    errors.push(`${product.name} - Size ${item.selectedSize} not available`)
                    continue
                }
                
                const available = sizeVariant.stock || 0
                if (item.quantity > available) {
                    errors.push(`${product.name} - Size ${item.selectedSize}: Only ${available} available, requested ${item.quantity}`)
                }
            } else {
                const totalStock = product.sizes?.reduce((sum: number, s: any) => sum + (s.stock || 0), 0) || 0
                if (item.quantity > totalStock) {
                    errors.push(`${product.name}: Only ${totalStock} available, requested ${item.quantity}`)
                }
            }
        }
    } catch (error) {
        console.error('Stock validation error:', error)
        throw new Error('Failed to validate stock availability')
    }
    
    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Decrement stock for order items using a Sanity transaction (atomic).
 * Call this after successful payment.
 */
export async function decrementStock(items: Array<{ productId: string; quantity: number; selectedSize?: string }>) {
    assertSanityToken()
    
    try {
        const productIds = items.map(item => item.productId)
        
        const query = `*[_type == "product" && _id in $ids] {
            _id,
            sizes[] {
                size,
                stock
            }
        }`
        
        const products = await serverClient.fetch<Array<{
            _id: string;
            sizes?: Array<{ size: string; stock: number }>;
        }>>(query, { ids: productIds })
        const productMap = new Map(products.map((p) => [p._id, p]))
        
        // Build a single transaction for all updates
        let transaction = serverClient.transaction()
        
        for (const item of items) {
            const product = productMap.get(item.productId)
            
            if (!product || !product.sizes) {
                console.error(`Product ${item.productId} not found or has no sizes`)
                continue
            }
            
            if (item.selectedSize) {
                // Update specific size stock
                const updatedSizes = product.sizes.map((s: any) => {
                    if (s.size?.toLowerCase() === item.selectedSize?.toLowerCase()) {
                        return {
                            ...s,
                            stock: Math.max(0, (s.stock || 0) - item.quantity)
                        }
                    }
                    return s
                })
                
                const patch = serverClient.patch(item.productId).set({ sizes: updatedSizes })
                transaction = (transaction as any).patch(patch)
            } else {
                // Decrement from first available size (fallback)
                const updatedSizes = [...product.sizes]
                let remaining = item.quantity
                
                for (let i = 0; i < updatedSizes.length && remaining > 0; i++) {
                    const available = updatedSizes[i].stock || 0
                    const toDeduct = Math.min(available, remaining)
                    updatedSizes[i] = {
                        ...updatedSizes[i],
                        stock: available - toDeduct
                    }
                    remaining -= toDeduct
                }
                
                const patch = serverClient.patch(item.productId).set({ sizes: updatedSizes })
                transaction = (transaction as any).patch(patch)
            }
        }
        
        // Commit all updates atomically
        await transaction.commit()
        
        return { success: true }
    } catch (error) {
        console.error('Stock decrement error:', error)
        throw new Error('Failed to decrement stock')
    }
}