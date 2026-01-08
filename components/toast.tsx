'use client'

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
    message: string
    type: ToastType
    onClose: () => void
    duration?: number
}

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconStyles = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
    const Icon = icons[type]

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-md animate-slide-up ${styles[type]}`}
            role="alert"
        >
            <Icon className={`h-5 w-5 flex-shrink-0 ${iconStyles[type]}`} />
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Close notification"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
