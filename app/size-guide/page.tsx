
import React from 'react';
import Link from 'next/link';

export default function SizeGuidePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-wider">Size Guide</h1>
        <p className="text-gray-600">Find your perfect fit with our detailed size charts.</p>
      </div>

      <div className="space-y-12">
        {/* Women&apos;s Size Chart */}
        <section>
          <h2 className="text-xl font-bold mb-6 uppercase tracking-wide border-b pb-2">Women&apos;s Sizing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold">
                  <th className="p-4 border-b">Size</th>
                  <th className="p-4 border-b">US</th>
                  <th className="p-4 border-b">UK</th>
                  <th className="p-4 border-b">EU</th>
                  <th className="p-4 border-b">Bust (in)</th>
                  <th className="p-4 border-b">Waist (in)</th>
                  <th className="p-4 border-b">Hips (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">XS</td>
                  <td className="p-4">0-2</td>
                  <td className="p-4">4-6</td>
                  <td className="p-4">32-34</td>
                  <td className="p-4">31-32</td>
                  <td className="p-4">24-25</td>
                  <td className="p-4">34-35</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">S</td>
                  <td className="p-4">4-6</td>
                  <td className="p-4">8-10</td>
                  <td className="p-4">36-38</td>
                  <td className="p-4">33-34</td>
                  <td className="p-4">26-27</td>
                  <td className="p-4">36-37</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">M</td>
                  <td className="p-4">8-10</td>
                  <td className="p-4">12-14</td>
                  <td className="p-4">40-42</td>
                  <td className="p-4">35-37</td>
                  <td className="p-4">28-30</td>
                  <td className="p-4">38-40</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">L</td>
                  <td className="p-4">12-14</td>
                  <td className="p-4">16-18</td>
                  <td className="p-4">44-46</td>
                  <td className="p-4">38-40</td>
                  <td className="p-4">31-33</td>
                  <td className="p-4">41-43</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">XL</td>
                  <td className="p-4">16-18</td>
                  <td className="p-4">20-22</td>
                  <td className="p-4">48-50</td>
                  <td className="p-4">41-43</td>
                  <td className="p-4">34-36</td>
                  <td className="p-4">44-46</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Men&apos;s Size Chart */}
        <section>
          <h2 className="text-xl font-bold mb-6 uppercase tracking-wide border-b pb-2">Men&apos;s Sizing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold">
                  <th className="p-4 border-b">Size</th>
                  <th className="p-4 border-b">US/UK</th>
                  <th className="p-4 border-b">EU</th>
                  <th className="p-4 border-b">Chest (in)</th>
                  <th className="p-4 border-b">Waist (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">S</td>
                  <td className="p-4">34-36</td>
                  <td className="p-4">44-46</td>
                  <td className="p-4">34-36</td>
                  <td className="p-4">28-30</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">M</td>
                  <td className="p-4">38-40</td>
                  <td className="p-4">48-50</td>
                  <td className="p-4">38-40</td>
                  <td className="p-4">32-34</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">L</td>
                  <td className="p-4">42-44</td>
                  <td className="p-4">52-54</td>
                  <td className="p-4">42-44</td>
                  <td className="p-4">36-38</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">XL</td>
                  <td className="p-4">46-48</td>
                  <td className="p-4">56-58</td>
                  <td className="p-4">46-48</td>
                  <td className="p-4">40-42</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">XXL</td>
                  <td className="p-4">50-52</td>
                  <td className="p-4">60-62</td>
                  <td className="p-4">50-52</td>
                  <td className="p-4">44-46</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Measurement Tips */}
        <section className="bg-gray-50 p-6 md:p-8 rounded-sm">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">How to Measure</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                    <h4 className="font-bold mb-2">Bust / Chest</h4>
                    <p className="text-gray-600">Measure around the fullest part of your bust or chest, keeping the tape measure horizontal.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-2">Waist</h4>
                    <p className="text-gray-600">Measure around the narrowest part of your waist (typically the small of your back and where your body bends side to side).</p>
                </div>
                <div>
                    <h4 className="font-bold mb-2">Hips</h4>
                    <p className="text-gray-600">Measure around the fullest part of your hips.</p>
                </div>
                 <div>
                    <h4 className="font-bold mb-2">Inseam</h4>
                    <p className="text-gray-600">Measure from the top of your inner leg along the inside seam to the bottom of your leg.</p>
                </div>
            </div>
        </section>

        <div className="mt-12 text-center">
             <Link href="/" className="text-sm border-b border-black pb-0.5 hover:text-gray-600 transition-colors">
                Return to Shop
             </Link>
        </div>
      </div>
    </div>
  );
}
