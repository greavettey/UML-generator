# Java to UML Generator (JS-Native Fork)

A clean, modern web application that automatically translates Java source code into high-quality UML class diagrams. 

This project is a fork of [iqbalhussein/uml-generator](https://github.com/iqbalhussein/uml-generator). **This fork completely reimplements the parser logic entirely in JavaScript.** By replacing the original Python/`javalang` backend with a native JS parser (powered by ANTLR4), this version eliminates cross-language dependencies, streamlines the development environment, and unlocks seamless serverless deployment.

Please note, the existence of this fork is not a critque of the original project. It was created to explore alternative implementations of the core design, and provide a version without cross language dependancies. The original project remains an excellent resource for understanding the overall architecture and design of a Java-to-UML generator and works exceptionally well.

## Features

- **Drag-and-Drop Uploads**: Easily upload multiple `.java` files simultaneously.
- **Accurate UML Parsing**: Accurately maps Java visibility modifiers (`+`, `-`, `#`), abstract methods, interfaces, inheritance (`IS-A`), and composition relationships (`HAS-A`) natively within the Node.js ecosystem.
- **Smart Filtering**: Automatically hides common Java standard libraries (like `ArrayList`, `Stack`, `HashMap`) from cluttering the diagram, ensuring the UML strictly focuses on your uploaded architecture.
- **Interactive Viewer**: Pan, zoom, and inspect generated UML diagrams using the built-in React component.
- **High-Res Export**: Download Diagrams as scalable vector shapes (SVG) or directly export them to crisp, upscaled Image files (PNG).

## Architecture

1. **Frontend**: A Next.js (React) application built with TailwindCSS for styling and `react-zoom-pan-pinch` for diagram interaction. Features native integration with Mermaid.js for drawing.
2. **Parser Pipeline**: The heavy lifting is now handled entirely in JavaScript. Using an ANTLR4-generated lexer and parser, the app traverses the Java Abstract Syntax Tree (AST) using a custom `ParseTreeWalker` and outputs a Mermaid class diagram definition string. 

## Prerequisites

Because the Python requirement has been successfully sidestepped, you only need one tool to run this application locally:

- **Node.js** (v18 or newer)

## Local Development Setup

1. **Install Dependencies:**
   Navigate to the project root and install the required npm packages (including `antlr4`).

   ```bash
   npm install
   ```

2. **Run the Development Server:**
   Kickstart the Next.js development server.

   ```bash
   npm run dev
   ```

3. **Open the App:**
   Open your browser and navigate to `http://localhost:3000`.

## Deployment

Deploying this app is now incredibly straightforward. Because the Python backend has been completely replaced with JavaScript, the application no longer requires a custom Docker container or a separate Flask/FastAPI microservice. 

**Vercel / Serverless Deployment (Recommended)**
You can now deploy this directly to Vercel, Netlify, or any standard Next.js hosting environment out-of-the-box. The parser runs seamlessly as part of the standard Node.js serverless functions. 

## License

MIT License