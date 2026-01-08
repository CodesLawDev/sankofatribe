/* eslint-disable react/no-unescaped-entities */
'use client'

import { X } from 'lucide-react'

interface SizeGuideModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div
                className="bg-white text-black max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                    <h2 className="text-xl uppercase tracking-wider font-medium">Size Guide</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close size guide"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Women's Sizing */}
                    <div>
                        <h3 className="text-sm uppercase tracking-wider font-medium mb-4">Women's Clothing</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Size</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">US</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Bust (in)</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Waist (in)</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Hip (in)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="px-4 py-3 font-medium">XS</td>
                                        <td className="px-4 py-3">0-2</td>
                                        <td className="px-4 py-3">31-32</td>
                                        <td className="px-4 py-3">24-25</td>
                                        <td className="px-4 py-3">34-35</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">S</td>
                                        <td className="px-4 py-3">4-6</td>
                                        <td className="px-4 py-3">33-34</td>
                                        <td className="px-4 py-3">26-27</td>
                                        <td className="px-4 py-3">36-37</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">M</td>
                                        <td className="px-4 py-3">8-10</td>
                                        <td className="px-4 py-3">35-36</td>
                                        <td className="px-4 py-3">28-29</td>
                                        <td className="px-4 py-3">38-39</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">L</td>
                                        <td className="px-4 py-3">12-14</td>
                                        <td className="px-4 py-3">37-39</td>
                                        <td className="px-4 py-3">30-32</td>
                                        <td className="px-4 py-3">40-42</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">XL</td>
                                        <td className="px-4 py-3">16-18</td>
                                        <td className="px-4 py-3">40-42</td>
                                        <td className="px-4 py-3">33-35</td>
                                        <td className="px-4 py-3">43-45</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Men's Sizing */}
                    <div>
                        <h3 className="text-sm uppercase tracking-wider font-medium mb-4">Men's Clothing</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Size</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">US</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Chest (in)</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Waist (in)</th>
                                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Hip (in)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="px-4 py-3 font-medium">S</td>
                                        <td className="px-4 py-3">34-36</td>
                                        <td className="px-4 py-3">34-36</td>
                                        <td className="px-4 py-3">28-30</td>
                                        <td className="px-4 py-3">35-37</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">M</td>
                                        <td className="px-4 py-3">38-40</td>
                                        <td className="px-4 py-3">38-40</td>
                                        <td className="px-4 py-3">32-34</td>
                                        <td className="px-4 py-3">38-40</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">L</td>
                                        <td className="px-4 py-3">42-44</td>
                                        <td className="px-4 py-3">42-44</td>
                                        <td className="px-4 py-3">36-38</td>
                                        <td className="px-4 py-3">41-43</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">XL</td>
                                        <td className="px-4 py-3">46-48</td>
                                        <td className="px-4 py-3">46-48</td>
                                        <td className="px-4 py-3">40-42</td>
                                        <td className="px-4 py-3">44-46</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">XXL</td>
                                        <td className="px-4 py-3">50-52</td>
                                        <td className="px-4 py-3">50-52</td>
                                        <td className="px-4 py-3">44-46</td>
                                        <td className="px-4 py-3">47-49</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Measuring Guide */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-sm uppercase tracking-wider font-medium mb-4">How to Measure</h3>
                        <ul className="space-y-2 text-sm text-neutral-700">
                            <li><strong>Chest/Bust:</strong> Measure around the fullest part of your chest/bust, keeping the tape parallel to the floor.</li>
                            <li><strong>Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</li>
                            <li><strong>Hip:</strong> Measure around the fullest part of your hips, approximately 8 inches below your waist.</li>
                        </ul>
                    </div>

                    {/* Fit Tips */}
                    <div>
                        <h3 className="text-sm uppercase tracking-wider font-medium mb-4">Fit Tips</h3>
                        <p className="text-sm text-neutral-700 mb-2">
                            If you're between sizes, we recommend sizing up for a more relaxed fit or sizing down for a more fitted look.
                        </p>
                        <p className="text-sm text-neutral-700">
                            Still unsure? Contact our customer service team at{' '}
                            <a href="mailto:support@sankofatribe.com" className="underline">support@sankofatribe.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
