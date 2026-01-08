'use client'

import { Check } from 'lucide-react'

interface CheckoutProgressProps {
    currentStep: 1 | 2 | 3 | 4
}

const steps = [
    { number: 1, label: 'Cart' },
    { number: 2, label: 'Shipping' },
    { number: 3, label: 'Payment' },
    { number: 4, label: 'Confirmation' },
]

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${currentStep > step.number
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : currentStep === step.number
                                            ? 'bg-brand-primary border-brand-primary text-white'
                                            : 'bg-white border-gray-300 text-gray-400'
                                    }`}
                            >
                                {currentStep > step.number ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-medium">{step.number}</span>
                                )}
                            </div>
                            <span
                                className={`text-xs mt-2 uppercase tracking-wider ${currentStep >= step.number ? 'text-brand-dark font-medium' : 'text-gray-400'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`h-0.5 flex-1 mx-2 transition-all ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
