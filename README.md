# Java to UML Generator

A clean, modern web application that automatically translates Java source code into high-quality UML class diagrams. This project uses a **Next.js** frontend for a premium UI and a robust **Python** backend leveraging `javalang` the AST to parse Java code into Mermaid.js vector definitions.

## Features

- **Drag-and-Drop Uploads**: Easily upload multiple `.java` files simultaneously.
- **Accurate UML Parsing**: Accurately maps Java visibility modifiers (`+`, `-`, `#`), abstract methods, interfaces, inheritance (`IS-A`), and composition relationships (`HAS-A`).
- **Smart Filtering**: Automatically hides common Java standard libraries (like `ArrayList`, `Stack`, `HashMap`) from cluttering the diagram, ensuring the UML strictly focuses on your uploaded architecture.
- **Interactive Viewer**: Pan, zoom, and inspect generated UML diagrams using the built-in React component.
- **High-Res Export**: Download Diagrams as scalable vector shapes (SVG) or directly export them to crisp, upscaled Image files (PNG).

## Architecture

1. **Frontend (`/web-app`)**: A Next.js (React) application built with TailwindCSS for styling and `react-zoom-pan-pinch` for diagram interaction. Native integration with Mermaid.js for drawing.
2. **Backend (`/python-parser`)**: A Python script designed to act as a microservice parser. Next.js calls this parser silently and streams the JSON payloads containing uploaded Java file contents to it. Python processes the AST and outputs a Mermaid class diagram definition string.

## Prerequisites

To run this application locally, you will need:

- **Node.js** (v18 or newer)
- **Python** (v3.8 or newer)
- **Pip** (Python package installer)

## Local Development Setup

1. **Install Python Dependencies:**
   Navigate to the `python-parser` directory and install the required `javalang` library.

   ```bash
   cd python-parser
   pip install -r requirements.txt
   ```

2. **Install Node Utilities & Run Frontend:**
   Navigate to the Next.js directory to install npm packages and kickstart the development server.

   ```bash
   cd ../web-app
   npm install
   npm run dev
   ```

3. **Open the App:**
   Once both environments are configured, open your browser and navigate to `http://localhost:3000`.

## Deployment

Deploying this app requires a server capable of running **both Node.js and Python** environments concurrently (since typical serverless Next.js functions on Vercel do not natively support spawning Python processes out-of-the-box).

### Docker Deployment (Recommended)

You can deploy the app to any container platform (Render, Railway, DigitalOcean App Platform, etc.) using Docker.

Create a `Dockerfile` that:

1. Installs a base Node image with Python and `pip` added via `apt-get`.
2. Installs the `requirements.txt` via `pip`.
3. Sets up the Next.js app, builds the production bundle `npm run build`, and exposes port `3000`.
4. Run using `npm start`.

### Vercel / Serverless Note

If you specifically plan to deploy to Vercel, you will need to decouple the Python execution by wrapping the `/python-parser/parse_java.py` inside a micro-API (such as Flask or FastAPI), host that Python API on Render or Heroku, and point the Next.js frontend to it instead of using `child_process.spawn`.

## License

MIT License
