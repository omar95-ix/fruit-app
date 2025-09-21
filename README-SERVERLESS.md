# Fruit App - Serverless Version

A serverless fruit and vegetable product management system built with Vercel, MongoDB Atlas, and React.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Vercel CLI (`npm i -g vercel`)
- MongoDB Atlas account
- Vercel account

### 1. Clone and Install
```bash
git clone <repository-url>
cd fruit-app
npm install
cd client && npm install && cd ..
```

### 2. Environment Setup
```bash
cp env.local.example .env.local
# Edit .env.local with your values
```

### 3. Deploy to Vercel
```bash
vercel login
vercel
```

## 🏗️ Architecture

### Serverless Functions
- **Authentication**: `/api/auth/*`
- **Products**: `/api/products/*`
- **Attributes**: `/api/attributes/*`
- **File Upload**: `/api/upload/*`

### Frontend
- React SPA served from Vercel CDN
- Responsive design
- Real-time filtering and search

### Database
- MongoDB Atlas (serverless compatible)
- Mongoose ODM with connection pooling

### File Storage
- Vercel Blob for images and videos
- Automatic CDN distribution

## 📁 Project Structure

```
fruit-app/
├── api/                    # Serverless functions
│   ├── auth/              # Authentication
│   │   ├── register.js
│   │   ├── login.js
│   │   └── me.js
│   ├── products/          # Product management
│   │   ├── index.js
│   │   └── [id].js
│   ├── attributes/        # Attribute management
│   │   └── index.js
│   └── upload/           # File upload
│       └── media.js
├── client/               # React frontend
├── lib/                  # Shared utilities
│   └── mongodb.js        # Database connection
├── models/               # MongoDB models
├── vercel.json          # Vercel configuration
└── DEPLOYMENT.md        # Detailed deployment guide
```

## 🔧 Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build"
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

### Environment Variables
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fruit-app
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## 🎯 Features

### ✅ Core Features
- **User Authentication**: JWT-based login/register
- **Product Management**: CRUD operations with dynamic attributes
- **File Upload**: Images and videos with Vercel Blob
- **Search & Filter**: Real-time product filtering
- **Responsive Design**: Mobile-first UI

### ✅ Serverless Benefits
- **Auto-scaling**: Handles traffic spikes automatically
- **Global CDN**: Fast loading worldwide
- **Zero maintenance**: No server management
- **Pay-per-use**: Cost-effective for variable traffic
- **Built-in monitoring**: Vercel analytics and logs

## 🚀 Deployment

### Development
```bash
vercel dev
```

### Production
```bash
vercel --prod
```

### Environment Variables in Vercel
1. Go to project settings
2. Add environment variables
3. Redeploy

## 📊 Performance

### Serverless Function Limits
- **Execution time**: 30 seconds max
- **Memory**: 1024MB
- **Payload**: 4.5MB request body

### Optimization Tips
- Use MongoDB connection pooling
- Implement caching where possible
- Optimize images before upload
- Use Vercel's edge functions for static data

## 🔒 Security

### Implemented
- JWT authentication
- Input validation
- CORS headers
- Environment variable protection
- MongoDB Atlas security

### Recommendations
- Rate limiting
- Input sanitization
- Regular secret rotation
- HTTPS enforcement (automatic)

## 💰 Cost Estimation

### Vercel (Free Tier)
- 100GB bandwidth/month
- 100GB-hours function execution
- Unlimited static sites

### MongoDB Atlas (Free Tier)
- 512MB storage
- Shared clusters

### Vercel Blob
- Pay-per-use storage
- CDN included

## 🛠️ Development

### Local Development
```bash
# Install Vercel CLI
npm i -g vercel

# Start development server
vercel dev

# Access at http://localhost:3000
```

### API Testing
```bash
# Test API endpoints
curl https://your-app.vercel.app/api/products
```

## 📈 Monitoring

### Vercel Dashboard
- Function execution metrics
- Error rates and logs
- Performance analytics
- Bandwidth usage

### MongoDB Atlas
- Database performance
- Connection monitoring
- Query optimization

## 🔄 CI/CD

### Automatic Deployments
- Push to main branch → Production
- Push to other branches → Preview
- Pull requests → Preview deployments

### Custom Domains
- Add custom domain in Vercel dashboard
- Automatic SSL certificates
- Global CDN distribution

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- [Serverless Best Practices](https://vercel.com/docs/concepts/functions/serverless-functions)

## 🆘 Support

For issues and questions:
1. Check Vercel function logs
2. Review MongoDB Atlas metrics
3. Check environment variables
4. Verify API endpoints

---

**Built with ❤️ using Vercel Serverless Functions**
