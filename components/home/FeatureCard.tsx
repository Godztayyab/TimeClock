'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  delay?: number
}

export function FeatureCard({ title, description, icon: Icon, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ delay, duration: 0.2 }}
      viewport={{ once: true }}
      className="group relative p-8 bg-white rounded-2xl border border-orange-100 hover:border-orange-200"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent rounded-2xl transition-opacity opacity-0 group-hover:opacity-100" />
      
      <div className="relative">
        <div className="mb-6 relative">
          <div className="absolute -inset-2 bg-orange-100/50 rounded-full blur-xl group-hover:bg-orange-200/50 transition-colors" />
          <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
            <Icon className="h-7 w-7 text-orange-600 transform group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>

        <div className="h-1.5 w-12 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mt-6 transform origin-left group-hover:scale-x-150 transition-transform" />
      </div>
    </motion.div>
  )
}