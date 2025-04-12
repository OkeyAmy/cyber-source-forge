# SourceFinder - AI-Powered Information Verification

SourceFinder is an advanced chat application that helps users find verified information by using AI to search, analyze, and verify multiple sources in real-time. Featuring a cyberpunk-inspired UI with blockchain aesthetics, SourceFinder delivers credible information with clear source attribution.

![SourceFinder Screenshot](https://lovable.dev/projects/e1529b77-9234-425a-8011-29d7d28e8ddf/screenshot)

## Features

- **Multi-Source Information Retrieval**: Aggregates information from Reddit, Twitter, Web, News, and Academic sources.
- **Real-time Source Verification**: Analyzes and verifies sources for credibility.
- **Interactive Chat Interface**: Modern, responsive UI with enhanced scrolling functionality.
- **Detailed Processing Visualization**: Visual feedback during query processing with progress indicators.
- **Session Management**: Save, reload, and export chat sessions.
- **Source Filtering**: Filter results by source type (Reddit, Academic, Web, etc.).
- **Customizable UI**: Cyberpunk-themed interface with blockchain-inspired visual elements.
- **Responsive Design**: Works seamlessly on mobile and desktop devices.
- **Accessible Design**: Implements ARIA attributes and keyboard navigation.

## Architecture

SourceFinder is built with a modern tech stack:

- **Frontend**: React, TypeScript, TailwindCSS
- **UI Components**: Shadcn UI, Radix UI primitives
- **API Integration**: RESTful API integration with https://source-finder-1.onrender.com
- **State Management**: React Context and local state management
- **Markdown Rendering**: ReactMarkdown for content display
- **Styling**: Tailwind CSS with custom animations and effects

## Recent Improvements

### Enhanced Scrolling Experience
- **Improved ScrollArea Component**: Fixed scrolling issues in chat interface
- **Better Scroll Position Management**: Maintains scroll position when new messages arrive
- **Smooth Auto-scrolling**: Intelligently scrolls to latest messages
- **Scroll Button**: Easily navigate to the most recent messages

### Advanced API Integration
- **Complete API Implementation**: Full integration with all SourceFinder API endpoints
- **Proper Type Safety**: Enhanced type definitions for API interactions
- **Improved Error Handling**: Better error management and user feedback
- **Source Filtering**: Support for filtering sources by type (Academic, Web, Social, etc.)

### Query Processing Visualization
- **Detailed Loading States**: Visual indicators for each step of processing
- **Progress Bar**: Shows progress through the query processing pipeline
- **Informative Messages**: Clear updates about what's happening during processing

## API Integration

The application integrates with the SourceFinder API deployed at https://source-finder-1.onrender.com with endpoints:

- `POST /api/process-query`: Process user queries and retrieve sources
- `GET /api/sources`: Get sources from current or specified session
- `GET /api/chats`: List all chat sessions
- `POST /api/chats`: Create new or update existing chat sessions
- `GET /api/current-session`: Get information about current session

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

```sh
# Clone the repository
git clone https://github.com/OkeyAmy/cyber-source-forge.git

# Navigate to project directory
cd cyber-source-forge

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. Open the application in your browser (default: http://localhost:5173)
2. Enter a question or topic in the input field
3. The AI will process your query and return information with verified sources
4. View source details in the "All Sources" tab
5. Filter sources by type using the filter controls
6. Create new chats or export existing ones using the header buttons

## Project Structure

```
cyber-source-forge/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── services/       # API service integration
│   ├── styles/         # Global styles
│   └── types/          # TypeScript type definitions
├── .env                # Environment variables
└── vite.config.ts      # Vite configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

The application can be deployed using:

- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com)
- Any static site hosting service

### Deployment via Lovable

Simply open [Lovable](https://lovable.dev/projects/e1529b77-9234-425a-8011-29d7d28e8ddf) and click on Share -> Publish.

## Custom Domain Setup

To connect a domain, navigate to Project > Settings > Domains in Lovable and click Connect Domain.
For more information, see [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [TailwindCSS](https://tailwindcss.com/) for utility-first CSS framework
- [React](https://reactjs.org/) for the UI library
- [Vite](https://vitejs.dev/) for fast development and building
- [SourceFinder API](https://source-finder-1.onrender.com) for the backend services
