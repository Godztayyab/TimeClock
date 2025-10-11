'use client'

import { Clock, Users, Building2, CalendarDays, ChartBar, ShieldCheck } from 'lucide-react'
import { FeatureCard } from './FeatureCard'
import { motion } from 'framer-motion'

const features = [
  {
    title: "Smart Time Tracking",
    description: "Intelligent clock-in/out system with real-time tracking and overtime detection",
    icon: Clock
  },
  {
    title: "Team Management",
    description: "Comprehensive employee management with detailed profiles and access controls",
    icon: Users
  },
  {
    title: "Multi-Department Control",
    description: "Organize and oversee multiple departments with customizable hierarchies",
    icon: Building2
  },
  {
    title: "Advanced Scheduling",
    description: "Dynamic scheduling with conflict detection and automated notifications",
    icon: CalendarDays
  },
  {
    title: "Insightful Analytics",
    description: "Detailed reports and analytics for data-driven workforce decisions",
    icon: ChartBar
  },
  {
    title: "Enterprise Security",
    description: "Role-based access control with advanced security features",
    icon: ShieldCheck
  }
]

export function FeaturesGrid() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent -z-10" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <FeatureCard key={feature.title} {...feature} delay={idx * 0.1} />
        ))}
      </div>
    </motion.div>
  )
}