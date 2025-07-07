'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Cloud, 
  Shield, 
  Zap, 
  Users, 
  FileText, 
  Image, 
  FolderOpen,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/auth/register')
    }
  }

  const features = [
    {
      icon: <Cloud className="h-8 w-8 text-blue-600" />,
      title: "Cloud Storage",
      description: "Secure cloud storage with 1GB free space for all your files and documents."
    },
    {
      icon: <FolderOpen className="h-8 w-8 text-green-600" />,
      title: "Smart Organization",
      description: "Organize files in folders with advanced filtering and search capabilities."
    },
    {
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      title: "Note Taking",
      description: "Create and manage notes with rich text formatting and tagging system."
    },
    {
      icon: <Image className="h-8 w-8 text-pink-600" />,
      title: "Media Support",
      description: "Upload and manage images, PDFs, and documents with preview support."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Secure & Private",
      description: "Your data is encrypted and secure with advanced authentication."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Fast & Reliable",
      description: "Lightning-fast performance with real-time synchronization."
    }
  ]

  const benefits = [
    "1GB free storage space",
    "Unlimited folders and notes",
    "Advanced search and filtering",
    "File sharing and collaboration",
    "Mobile responsive design",
    "Real-time analytics dashboard"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">StorageHub</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Button onClick={() => router.push('/dashboard')} className="bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Files,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Organized
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              A modern storage management system that helps you organize files, create notes, 
              and manage your digital life with powerful analytics and intuitive design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Today'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-gray-500">No credit card required • 1GB free storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make file management simple and efficient
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why choose StorageHub?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built with modern technology and user experience in mind, 
                StorageHub provides everything you need to manage your digital assets effectively.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">1GB</div>
                    <div className="text-blue-100">Free Storage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">∞</div>
                    <div className="text-blue-100">Files & Folders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">24/7</div>
                    <div className="text-blue-100">Support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">99.9%</div>
                    <div className="text-blue-100">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to get organized?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust StorageHub to manage their digital life.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Start Your Free Account'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Cloud className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">StorageHub</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Modern storage management system built with cutting-edge technology 
                to help you organize and manage your digital assets efficiently.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StorageHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}