'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Cloud, 
  FolderPlus, 
  FileText, 
  Image, 
  FileIcon, 
  Star,
  Plus,
  Search,
  Grid3X3,
  List,
  Filter,
  Upload,
  Settings,
  User,
  LogOut,
  Bell,
  HardDrive,
  Folder,
  File,
  StickyNote,
  TrendingUp,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { api } from '@/lib/api'

interface User {
  id: string
  username: string
  email: string
  storageUsed: number
  storageLimit: number
  storagePercentage: number
}

interface Summary {
  storage: {
    used: number
    limit: number
    percentage: number
    available: number
  }
  counts: {
    folders: number
    files: number
    notes: number
    favorites: {
      total: number
    }
  }
  fileTypes: {
    images: number
    pdfs: number
    documents: number
    others: number
  }
  recent: {
    files: any[]
    notes: any[]
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchSummary()
  }, [router])

  const fetchSummary = async () => {
    try {
      const response = await api.get('/summary')
      if (response.data.success) {
        setSummary(response.data.data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const quickActions = [
    {
      icon: <FolderPlus className="h-6 w-6" />,
      label: 'Create Folder',
      description: 'Organize your files',
      color: 'bg-blue-500',
      action: () => console.log('Create folder')
    },
    {
      icon: <FileText className="h-6 w-6" />,
      label: 'Add Note',
      description: 'Write something down',
      color: 'bg-green-500',
      action: () => console.log('Add note')
    },
    {
      icon: <Upload className="h-6 w-6" />,
      label: 'Upload Files',
      description: 'Add images or documents',
      color: 'bg-purple-500',
      action: () => console.log('Upload files')
    },
    {
      icon: <Star className="h-6 w-6" />,
      label: 'Favorites',
      description: 'View starred items',
      color: 'bg-yellow-500',
      action: () => console.log('View favorites')
    }
  ]

  const fileTypeStats = [
    {
      icon: <Image className="h-5 w-5 text-pink-600" />,
      label: 'Images',
      count: summary?.fileTypes.images || 0,
      color: 'bg-pink-100'
    },
    {
      icon: <FileIcon className="h-5 w-5 text-red-600" />,
      label: 'PDFs',
      count: summary?.fileTypes.pdfs || 0,
      color: 'bg-red-100'
    },
    {
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      label: 'Documents',
      count: summary?.fileTypes.documents || 0,
      color: 'bg-blue-100'
    },
    {
      icon: <File className="h-5 w-5 text-gray-600" />,
      label: 'Others',
      count: summary?.fileTypes.others || 0,
      color: 'bg-gray-100'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Cloud className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">StorageHub</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search files, folders, and notes..."
                  className="pl-10 pr-4 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.username}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your storage today.
          </p>
        </div>

        {/* Storage Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-blue-600" />
                <span>Storage Usage</span>
              </CardTitle>
              <CardDescription>
                {formatFileSize(summary?.storage.used || 0)} of {formatFileSize(summary?.storage.limit || 0)} used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress 
                  value={summary?.storage.percentage || 0} 
                  className="h-3"
                />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {summary?.counts.folders || 0}
                    </div>
                    <div className="text-gray-600">Folders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {summary?.counts.files || 0}
                    </div>
                    <div className="text-gray-600">Files</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {summary?.counts.notes || 0}
                    </div>
                    <div className="text-gray-600">Notes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>Favorites</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {summary?.counts.favorites.total || 0}
                </div>
                <p className="text-gray-600 text-sm">
                  Items marked as favorite
                </p>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View All Favorites
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`${action.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-200`}>
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.label}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* File Types & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* File Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>File Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fileTypeStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${stat.color} p-2 rounded-lg`}>
                        {stat.icon}
                      </div>
                      <span className="font-medium text-gray-900">{stat.label}</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-700">{stat.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.recent.files.slice(0, 3).map((file, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <File className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.folder}
                      </p>
                    </div>
                  </div>
                ))}
                {summary?.recent.notes.slice(0, 2).map((note, index) => (
                  <div key={`note-${index}`} className="flex items-center space-x-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <StickyNote className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {note.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {note.preview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle & Content Area */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your Content</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-2'}>
          {/* Placeholder content - you would replace this with actual folders, files, and notes */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 text-center">
              <Folder className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Documents</h3>
              <p className="text-sm text-gray-600">12 items</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 text-center">
              <Folder className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Images</h3>
              <p className="text-sm text-gray-600">8 items</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 text-center">
              <StickyNote className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Meeting Notes</h3>
              <p className="text-sm text-gray-600">Last edited 2 hours ago</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 text-center">
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Add New</h3>
              <p className="text-sm text-gray-600">Create folder or note</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}