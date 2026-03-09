import antlr4 from "antlr4";
import Java8Lexer from "./generated/Java8Lexer.js";
import Java8Parser from "./generated/Java8Parser.mjs";

import generateMermaid from "./GenerateMermaid.js";
import JavaToMermaidListener from "./JavaToMermaidListener.js";

function parseJavaString(javaCode) {
    return batchParseJavaFiles([javaCode]);
}

function batchParseJavaFiles(fileContents) {
    const allClasses = {};
    const allRelationships = [];

    fileContents.forEach(content => {
        const chars = new antlr4.InputStream(content);
        const lexer = new Java8Lexer(chars);
        const tokens = new antlr4.CommonTokenStream(lexer);
        const parser = new Java8Parser(tokens);

        const tree = parser.compilationUnit();

        const listener = new JavaToMermaidListener();
        antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);

        Object.assign(allClasses, listener.classes);
        allRelationships.push(...listener.relationships);
    });

    return generateMermaid(allClasses, allRelationships);
}

export {
    parseJavaString,
    batchParseJavaFiles,
    generateMermaid,
    JavaToMermaidListener 
};