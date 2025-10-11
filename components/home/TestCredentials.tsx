'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { USERS } from "@/prisma/seed-data"



export function TestCredentials() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedStates(prev => ({ ...prev, [type]: true }))
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [type]: false }))
    }, 2000)
  }

  return (
    <section className="py-16 bg-orange-50/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Try TimeClock</h2>
          <p className="text-gray-600">Use these test credentials to explore different user roles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USERS.map((cred, idx) => (
            <motion.div
              key={cred.email}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {cred.type}
                    <Badge 
                      variant="outline" 
                      className="bg-orange-100 text-orange-800 border-orange-200"
                    >
                      {cred.role}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{cred.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="flex items-center justify-between bg-orange-50 p-2 rounded-md">
                      <code className="text-sm">{cred.email}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cred.email, `${cred.type}-email`)}
                      >
                        {copiedStates[`${cred.type}-email`] ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Password</div>
                    <div className="flex items-center justify-between bg-orange-50 p-2 rounded-md">
                      <code className="text-sm">{cred.password}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cred.password, `${cred.type}-password`)}
                      >
                        {copiedStates[`${cred.type}-password`] ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}