# Real-time Auction System

A modern, full-stack auction platform built with React, TypeScript, Node.js, and WebSocket for real-time bidding functionality.

## Features

### User Features
- **User Authentication**
  - Secure signup and login
  - Email verification
  - Password reset functionality
  - Profile management

- **Auction Management**
  - Create and manage auctions
  - Upload item images
  - Set starting prices and deadlines
  - Real-time bidding system
  - Automatic auction closure
  - Item resubmission for unsold items

- **Bidding System**
  - Real-time bid updates
  - Automatic bid validation
  - Bid history tracking
  - Winner notification
  - Payment integration (Khalti)

- **Search and Filtering**
  - Category-based filtering
  - Price range filtering
  - Sorting options (time left, price)
  - Featured items section
  - Expiring soon section

### Admin Features
- **Dashboard**
  - User management
  - Item approval system
  - Analytics and statistics
  - System monitoring

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- WebSocket for real-time updates
- React Icons for UI elements
- React Hot Toast for notifications

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- WebSocket for real-time communication
- JWT for authentication
- Email service integration

### Additional Services
- Docker for containerization
- Worker service for background tasks
- Payment gateway integration (Khalti)

## Project Structure

```
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── Contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   └── helperFunctions/ # Utility functions
├── backend/              # Node.js backend server
│   ├── src/
│   │   ├── controller/   # Business logic
│   │   ├── router/       # API routes
│   │   └── prisma/       # Database schema and migrations
├── worker/              # Background service
└── docker-compose.yml   # Docker configuration
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Docker and Docker Compose
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Real-time-Auction-System.git
cd Real-time-Auction-System
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/auction_db"
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE_API_KEY=your_email_api_key
```

4. Start the development servers:
```bash
# Using Docker (recommended)
docker-compose up

# Or manually
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev
```

## Key Features Implementation

### Real-time Bidding
- WebSocket connection for instant bid updates
- Bid validation and processing
- Automatic winner determination
- Notification system for outbid users

### Item Management
- Image upload and processing
- Approval workflow for new items
- Automatic status updates
- Resubmission system for unsold items

### User Experience
- Responsive design
- Intuitive navigation
- Real-time updates
- Error handling and validation
- Loading states and animations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React and TypeScript communities
- Tailwind CSS for styling
- WebSocket for real-time functionality
- Khalti for payment integration 