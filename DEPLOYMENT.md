# Vercel Deployment Guide

This guide will help you deploy the Fruit App to Vercel as a serverless application.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a MongoDB Atlas cluster
3. **Vercel CLI**: Install globally with `npm i -g vercel`

## Setup Steps

### 1. Install Dependencies

```bash
# Install Vercel CLI globally
npm install -g vercel

# Install project dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.local.example .env.local
```

Fill in your environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fruit-app
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
5. Get your connection string

### 4. Vercel Blob Storage Setup

1. Go to your Vercel dashboard
2. Navigate to Storage → Blob
3. Create a new Blob store
4. Get your `BLOB_READ_WRITE_TOKEN`

### 5. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

### 6. Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/fruit-app
JWT_SECRET = your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE = 7d
BLOB_READ_WRITE_TOKEN = your_vercel_blob_token_here
```

## Project Structure

```
fruit-app/
├── api/                    # Serverless functions
│   ├── auth/              # Authentication endpoints
│   ├── products/          # Product management
│   ├── attributes/        # Attribute management
│   └── upload/           # File upload
├── client/               # React frontend
├── lib/                  # Shared utilities
├── models/               # MongoDB models
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (Admin)
- `DELETE /api/products/[id]` - Delete product (Admin)
- `GET /api/attributes` - Get all attributes
- `POST /api/attributes` - Create attribute (Admin)
- `POST /api/upload/media` - Upload files (Admin)

## Development

```bash
# Start development server
vercel dev

# Build for production
npm run build
```

## Features

- ✅ Serverless architecture
- ✅ MongoDB Atlas integration
- ✅ JWT authentication
- ✅ File upload with Vercel Blob
- ✅ Dynamic attributes system
- ✅ Product management
- ✅ Responsive React frontend
- ✅ Search and filtering
- ✅ Image and video support

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure your IP is whitelisted in MongoDB Atlas
2. **Environment Variables**: Make sure all required variables are set in Vercel
3. **File Upload**: Verify BLOB_READ_WRITE_TOKEN is correct
4. **CORS Issues**: CORS headers are handled in each API function

### Logs

View function logs in the Vercel dashboard under Functions tab.

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth and 100GB-hours of serverless function execution
- **MongoDB Atlas**: Free tier includes 512MB storage
- **Vercel Blob**: Pay-per-use storage pricing

## Security Notes

- Use strong JWT secrets
- Implement rate limiting for production
- Validate all inputs
- Use HTTPS (automatic with Vercel)
- Regularly rotate secrets
