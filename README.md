# Java to UML Generator (100% Client-Side Fork)

> This particular branch is live at [axel.gg/p/umlgen](https://axel.gg/p/umlgen) 

A lightning-fast, zero-backend web application that automatically translates Java source code into high-quality UML class diagrams directly in your browser. 

This project is a fork of [iqbalhussein/uml-generator](https://github.com/iqbalhussein/uml-generator). **This fork completely removes the Python backend and Next.js/React dependencies, reimagining the tool as a pure Vanilla JS static site.** By leveraging a native JavaScript ANTLR4 parser and Vite, your source code never leaves your machine, ensuring total privacy, zero server costs, and instant diagram generation.

## Features

- **100% Private & Serverless**: Files are read and parsed entirely within your browser using the HTML5 File API. No source code is ever uploaded to a server.
- **Accurate UML Parsing**: Accurately maps Java visibility modifiers (`+`, `-`, `#`), abstract methods, interfaces, inheritance (`IS-A`), and composition relationships (`HAS-A`) natively via ANTLR4.
- **Smart Filtering**: Automatically hides common Java standard libraries (like `ArrayList`, `Stack`, `HashMap`) from cluttering the diagram.
- **Interactive Viewer**: Seamlessly pan and zoom around massive architecture diagrams using the lightweight `panzoom` library.
- **High-Res Export**: Download Diagrams as scalable vector shapes (SVG) or directly export them to crisp, upscaled Image files (PNG) via native browser canvas rendering.
- **Batch Drag-and-Drop**: Easily upload entire directories or multiple `.java` files simultaneously.

## Architecture

1. **Frontend UI**: Vanilla HTML/JS/CSS bundled with **Vite**. Interaction is handled via lightweight DOM manipulation and the `panzoom` utility.
2. **Parser Pipeline**: The heavy lifting is handled natively in JavaScript. Using an ANTLR4-generated lexer and parser, the app traverses the Java Abstract Syntax Tree (AST) using a custom `ParseTreeWalker`.
3. **Rendering Engine**: The parser outputs a raw `classDiagram` string which is compiled into a vector graphic using **Mermaid.js**.

## Local Development Setup

Because this is a static Vite application, you only need Node.js installed to download the dependencies and run the local development server.

1. **Install Dependencies:**
   Navigate to the project root and install the required npm packages.

   ```bash
   npm install
   ```