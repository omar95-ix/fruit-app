# Fruit & Vegetable Product Management System

A comprehensive Node.js web application for managing fruits and vegetables products with dynamic attributes, authentication, and advanced filtering capabilities.

## Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Protected admin routes
- Role-based access control

### 📦 Product Management (CRUD)
- Add, edit, delete, and list products
- Product attributes: Name, Title, Price, Status
- Dynamic attribute system
- Product status management (Active/Inactive)

### 🏷️ Dynamic Attributes System
- Create custom attributes (e.g., "Type", "Freezing Type", "Color", "Size")
- Multiple options per attribute
- Link products with attributes and their options
- Flexible attribute management

### 🔍 Advanced Product Listing
- Search by name and title
- Filter by attributes and options
- Sort by price (high to low, low to high), name, and date
- Price range filtering
- Status filtering
- Pagination support

### 🎨 Modern UI/UX
- Responsive design
- Clean and intuitive interface
- Real-time filtering and search
- Mobile-friendly layout

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React** 18
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** for styling

## Project Structure

```
fruit-app/
├── server.js                 # Main server file
├── package.json              # Backend dependencies
├── env.example              # Environment variables template
├── models/                   # MongoDB models
│   ├── User.js
│   ├── Product.js
│   └── Attribute.js
├── routes/                   # API routes
│   ├── auth.js
│   ├── products.js
│   └── attributes.js
├── middleware/              # Custom middleware
│   └── auth.js
└── client/                  # React frontend
    ├── package.json
    ├── public/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        └── utils/
```

## Database Models

### User Model
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `role`: User role (admin/user)
- `createdAt`: Account creation date

### Product Model
- `name`: Product name (e.g., "Strawberry")
- `title`: Short description
- `price`: Numeric price
- `status`: Active/Inactive status
- `attributes`: Array of attribute references with selected options
- `createdAt`, `updatedAt`: Timestamps

### Attribute Model
- `name`: Attribute name (e.g., "Type", "Freezing Type")
- `options`: Array of available options
- `createdAt`, `updatedAt`: Timestamps

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filtering, sorting, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Attributes
- `GET /api/attributes` - Get all attributes
- `GET /api/attributes/:id` - Get single attribute
- `POST /api/attributes` - Create attribute (Admin only)
- `PUT /api/attributes/:id` - Update attribute (Admin only)
- `DELETE /api/attributes/:id` - Delete attribute (Admin only)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fruit-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fruit-app
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the React app**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage Examples

### Creating Attributes
1. Login as admin
2. Go to Dashboard
3. Click "Add Attribute"
4. Enter attribute name (e.g., "Type")
5. Add options (e.g., "Festival", "Sensation")
6. Save the attribute

### Adding Products
1. Go to Dashboard
2. Click "Add Product"
3. Fill in product details:
   - Name: "Strawberry"
   - Title: "Fresh organic strawberries"
   - Price: 5.99
   - Status: Active
4. Select attributes and their options
5. Save the product

### Filtering Products
1. Go to the main product listing page
2. Use the filters sidebar:
   - Search by name/title
   - Filter by status
   - Set price range
   - Select attribute options
   - Choose sorting option
3. Results update in real-time

## Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect your GitHub repository
4. Deploy automatically on push

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fruit-app
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
# fruit-app
