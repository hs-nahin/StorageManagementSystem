# Storage Management System

A modern, full-stack storage management system built with Node.js, Express.js, MongoDB, Next.js, and shadcn/ui components. This application provides a comprehensive solution for managing files, folders, notes, and digital assets with advanced features like analytics, search, and user authentication.

## 🚀 Features

### Authentication & Security
- User registration and login
- JWT-based authentication
- Password reset functionality
- Secure password hashing with bcrypt
- Input validation and sanitization

### Storage Management
- **File Upload & Management**: Support for images, PDFs, documents
- **Folder Organization**: Create, rename, delete, and organize folders
- **Note Taking**: Rich text notes with tagging and color coding
- **Favorites System**: Mark files, folders, and notes as favorites
- **Search & Filter**: Advanced search across all content types
- **File Operations**: Copy, rename, duplicate, and delete files

### Dashboard & Analytics
- **Storage Overview**: Visual representation of storage usage
- **File Type Analytics**: Breakdown by file types (images, PDFs, documents)
- **Recent Activity**: Track recently accessed files and notes
- **Summary API**: Comprehensive statistics and insights
- **Responsive Design**: Mobile-first, fully responsive interface

### Advanced Features
- **Real-time Updates**: Live storage usage tracking
- **Drag & Drop**: Intuitive file upload interface
- **Preview Support**: File previews and thumbnails
- **Bulk Operations**: Handle multiple files simultaneously
- **Export/Import**: Data portability features

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Recharts** - Data visualization

## 📁 Project Structure

```
storage-management-system/
├── backend/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Folder.js
│   │   ├── File.js
│   │   └── Note.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── folders.js
│   │   ├── files.js
│   │   ├── notes.js
│   │   └── summary.js
│   ├── uploads/
│   ├── package.json
│   ├── server.js
│   └── postman_collection.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── dashboard/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   └── ui/
│   │   └── lib/
│   │       ├── api.ts
│   │       └── utils.ts
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/storage-management
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Folders Endpoints
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create folder
- `GET /api/folders/:id` - Get folder by ID
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder
- `POST /api/folders/:id/duplicate` - Duplicate folder

### Files Endpoints
- `GET /api/files` - Get all files
- `POST /api/files/upload` - Upload files
- `GET /api/files/:id` - Get file by ID
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/:id/download` - Download file
- `POST /api/files/:id/duplicate` - Duplicate file

### Notes Endpoints
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get note by ID
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/duplicate` - Duplicate note
- `GET /api/notes/search/:query` - Search notes

### Summary Endpoints
- `GET /api/summary` - Get storage summary
- `GET /api/summary/analytics` - Get detailed analytics

## 🧪 Testing

### Using Postman
Import the provided `postman_collection.json` file into Postman to test all API endpoints.

### Manual Testing
1. Register a new user account
2. Login and receive JWT token
3. Create folders and upload files
4. Create and manage notes
5. Test search and filter functionality
6. Verify analytics and summary data

## 🔧 Configuration

### Database Configuration
The application uses MongoDB with Mongoose ODM. Configure your database connection in the `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/storage-management
# or for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/storage-management
```

### File Upload Configuration
Files are stored locally in the `uploads` directory. For production, consider using cloud storage services like AWS S3 or Cloudinary.

### Security Configuration
- JWT tokens expire in 7 days by default
- Password requirements: minimum 6 characters, must contain uppercase, lowercase, and number
- File upload limits: 50MB per file, 10 files maximum per upload
- Rate limiting: 100 requests per 15 minutes per IP

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Create a new project on your chosen platform
2. Connect your GitHub repository
3. Set environment variables
4. Deploy the backend service

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Configure environment variables
5. Deploy the frontend

### Database Deployment (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Configure network access and database users
3. Update the `MONGODB_URI` in your environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [MongoDB](https://www.mongodb.com/) for the flexible database solution
- [Express.js](https://expressjs.com/) for the robust web framework

## 📞 Support

For support, email support@storagehub.com or create an issue in the GitHub repository.

---

**Built with ❤️ by the StorageHub Team**