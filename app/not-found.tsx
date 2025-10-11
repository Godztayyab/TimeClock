'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-orange-50/50 ">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800">
                404 - Page Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Sorry, the page you’re looking for doesn’t exist or has been moved.
              </p>
              <Button
                variant="ghost"
                asChild
                className="bg-orange-50 text-orange-800 hover:bg-orange-100"
              >
                <Link href="/">Go Back Home</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}