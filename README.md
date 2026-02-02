# Modern Real-time Chat Application

A stunning, feature-rich real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. This project features a modern Glassmorphism UI design, seamless media sharing, and robust messaging capabilities.

![Chat App Screenshot](https://raw.githubusercontent.com/username/repo/main/screenshot.png)

## 🚀 Features

### Core Messaging
- **Real-time Communication**: Instant messaging powered by Socket.io.
- **Media Support**: Send and receive images, audio messages, and file attachments.
- **Rich Interactions**: Emoji pickers, message reactions, and read receipts.
- **Message Management**: "Delete for me" and "Delete for everyone" functionality.

### User Experience
- **Typing Indicators**: Real-time visual feedback when users are typing.
- **Online Status**: Live user availability tracking.
- **Responsive Design**: Fully optimized for desktop and mobile devices.
- **Glassmorphism UI**: A premium, modern interface with smooth animations and translucid elements.
- **Sound Effects**: Audio feedback for sent and received messages.

### Security & Tech
- **Authentication**: Secure JWT-based login and registration.
- **Password Hashing**: Bcrypt encryption for user security.
- **Robust Backend**: RESTful API structure with Express and Mongoose.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion / GSAP (Animations), Lucide React (Icons), Radix UI.
- **Backend**: Node.js, Express.js, Socket.io.
- **Database**: MongoDB.
- **State Management**: React Hooks & Context API.

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install Dependencies**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=4000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

4.  **Run the Application**
    ```bash
    # Start Backend
    cd server
    npm run dev

    # Start Frontend (in a new terminal)
    cd client
    npm run dev
    ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
