# Interactive Quiz App

A modern, responsive Interactive Quiz App built with vanilla HTML, CSS, and JavaScript. Features AI-powered quiz generation using OpenRouter API and local storage for custom quizzes.

## ✨ Features

- **🤖 AI-Powered Quiz Generation**: Generate quizzes on any topic using OpenRouter API
- **📝 Custom Quiz Creator**: Create and edit your own quizzes with a user-friendly interface
- **💾 Local Storage**: Save and manage quizzes locally in your browser
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **♿ Accessible**: Built with semantic HTML, ARIA attributes, and keyboard navigation
- **🎯 Interactive Taking**: Immediate feedback, progress tracking, and detailed results
- **🔒 Secure**: API keys are never exposed to the client-side

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- NPM or Yarn
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kdippan/Quiz-App.git
   cd Quiz-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenRouter API key:
   ```env
   OPENROUTER_KEY=your_actual_openrouter_key_here
   PORT=4000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:4000`

## 🛠️ Development

### Project Structure

```
Quiz-App/
├── client/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Styles and responsive design
│   ├── app.js            # Main application logic
│   ├── components/        # Modular JavaScript components
│   │   ├── quizRenderer.js      # Quiz taking functionality
│   │   ├── quizCreator.js       # Quiz creation interface
│   │   └── localStorageManager.js # Local storage operations
│   ├── utils/            # Utility functions
│   │   └── scoring.js    # Score calculation and validation
│   └── assets/           # Static assets
│       └── logo.svg      # Application logo
├── server/               # Backend files
│   ├── index.js          # Express server
│   ├── openrouterClient.js # OpenRouter API client
│   ├── routes/           # API routes
│   │   └── generateQuiz.js # Quiz generation endpoint
│   └── middleware/       # Express middleware
│       └── validateRequest.js # Request validation
├── netlify/functions/    # Netlify serverless functions
├── api/                  # Vercel serverless functions
├── tests/               # Test files
└── scripts/             # Build and deployment scripts
```

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run build` - Build for production

### Testing

Run the test suite:
```bash
npm test
```

Open the browser test runner:
```bash
open tests/test-runner.html
```

## 🔧 API Configuration

### OpenRouter Integration

The app uses OpenRouter's API to generate quizzes. The integration:

1. **Server-side only**: API key is never exposed to the client
2. **Validated requests**: Input validation and sanitization
3. **Error handling**: Graceful error handling with user-friendly messages
4. **Rate limiting**: Built-in protection against abuse

### API Endpoint

**POST** `/api/generate-quiz`

Request body:
```json
{
  "topic": "Solar System",
  "number_of_questions": 5,
  "difficulty": "easy"
}
```

Response:
```json
{
  "success": true,
  "quiz": {
    "quizTitle": "Solar System Basics",
    "questions": [
      {
        "id": "q1",
        "questionText": "Which planet is known as the Red Planet?",
        "options": ["Earth", "Mars", "Venus", "Jupiter"],
        "correctIndex": 1
      }
    ]
  }
}
```

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect your repository** to Netlify
2. **Set environment variables** in Netlify dashboard:
   - `OPENROUTER_KEY`: Your OpenRouter API key
3. **Deploy settings**:
   - Build command: `npm run build`
   - Publish directory: `client`
4. **Functions**: Automatically detected from `netlify/functions/`

### Vercel

1. **Import project** to Vercel
2. **Set environment variables**:
   - `OPENROUTER_KEY`: Your OpenRouter API key
3. **Deploy**: Automatic deployment on push

### Heroku

1. **Create a new Heroku app**
   ```bash
   heroku create your-quiz-app
   ```

2. **Set environment variables**
   ```bash
   heroku config:set OPENROUTER_KEY=your_key_here
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Self-Hosted

For VPS or dedicated server deployment:

1. **Clone and setup** as described in Quick Start
2. **Use PM2** for process management:
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name quiz-app
   ```
3. **Configure reverse proxy** (nginx/Apache)
4. **SSL certificate** with Let's Encrypt

## 🔐 Security

### Important Security Notes

- **Never commit your API key** to version control
- **Use environment variables** for all secrets
- **API key is server-side only** - never exposed to clients
- The `.env` file is automatically ignored by git
- Consider rate limiting in production

### Production Security Checklist

- [ ] API key set as environment variable
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error messages don't expose sensitive information
- [ ] CORS properly configured

## 🎨 Customization

### Styling

The app uses CSS custom properties for easy theming:

```css
:root {
  --primary-color: #4f46e5;
  --secondary-color: #6b7280;
  --success-color: #10b981;
  --error-color: #ef4444;
  /* ... more variables */
}
```

### Adding Features

The modular architecture makes it easy to add features:

1. **New quiz types**: Extend the quiz schema in `localStorageManager.js`
2. **Different question formats**: Add new components in `components/`
3. **Additional APIs**: Create new clients in `server/`

## 📊 Features Overview

### Quiz Generation
- AI-powered question generation
- Customizable difficulty levels
- Topic-based content
- Automatic validation

### Quiz Taking
- Progress tracking
- Immediate feedback
- Timed questions (optional)
- Detailed results

### Quiz Management
- Create custom quizzes
- Edit existing quizzes
- Local storage persistence
- Import/export functionality

### User Experience
- Responsive design
- Keyboard navigation
- Screen reader support
- Toast notifications
- Loading states

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/kdippan/Quiz-App/issues)
- **Documentation**: Check this README and inline code comments
- **Community**: Join discussions in GitHub Discussions

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- AI-powered quiz generation
- Custom quiz creator
- Local storage management
- Responsive design
- Accessibility features
- Multiple deployment options

---

**Built with ❤️ using vanilla web technologies**