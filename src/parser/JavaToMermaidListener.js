import Java8ParserListener from "./generated/Java8ParserListener.mjs";

class JavaToMermaidListener extends Java8ParserListener {
    constructor() {
        super();
        this.classes = {};
        this.relationships = [];

        this.ignoreTypes = new Set([
            'String', 'Integer', 'Double', 'Boolean', 'Character', 'Byte', 'Short', 'Long', 'Float',
            'Object', 'Class', 'List', 'ArrayList', 'LinkedList', 'Map', 'HashMap', 'TreeMap',
            'Set', 'HashSet', 'TreeSet', 'Collection', 'Iterator', 'Random', 'Scanner', 'File',
            'InputStream', 'OutputStream', 'Reader', 'Writer', 'Exception', 'Throwable', 'Error',
            'RuntimeException', 'Thread', 'Runnable', 'Math', 'Arrays', 'Collections', 'Stack'
        ]);

        this.activeContextName = null;
    }

    enterNormalClassDeclaration(ctx) {
        this.activeContextName = ctx.Identifier().getText();
        this.classes[this.activeContextName] = { type: 'class', fields: [], methods: [] };

        // Handle Inheritance (extends)
        const superclassCtx = ctx.superclass();
        if (superclassCtx) {
            const superClass = superclassCtx.classType().getText();
            this.relationships.push(`${superClass} <|-- ${this.activeContextName}`);
        }

        // Handle Interfaces (implements)
        const interfacesCtx = ctx.superinterfaces();
        if (interfacesCtx) {
            const interfaces = interfacesCtx.interfaceTypeList().interfaceType();
            interfaces.forEach(i => {
                this.relationships.push(`${i.getText()} <|.. ${this.activeContextName}`);
            });
        }
    }

    exitNormalClassDeclaration(ctx) {
        this.activeContextName = null;
    }

    enterNormalInterfaceDeclaration(ctx) {
        this.activeContextName = ctx.Identifier().getText();
        this.classes[this.activeContextName] = { type: 'interface', fields: [], methods: [] };

        // Add Mermaid <<interface>> stereotype
        this.relationships.push(`class ${this.activeContextName} {\n  <<interface>>\n}`);

        // Handle Interface Inheritance (extends)
        const extendsCtx = ctx.extendsInterfaces();
        if (extendsCtx) {
            const interfaceTypes = extendsCtx.interfaceTypeList().interfaceType();
            interfaceTypes.forEach(i => {
                this.relationships.push(`${i.getText()} <|-- ${this.activeContextName}`);
            });
        }
    }

    exitNormalInterfaceDeclaration(ctx) {
        this.activeContextName = null;
    }

    enterConstructorDeclaration(ctx) {
        if (!this.activeContextName) return;

        const modifiers = ctx.constructorModifier ? ctx.constructorModifier() : [];
        const visibility = this.getVisibility(modifiers);

        const declarator = ctx.constructorDeclarator();
        if (!declarator) return;

        const name = declarator.simpleTypeName().getText();

        const paramsCtx = declarator.formalParameterList();
        const paramsStr = paramsCtx ? paramsCtx.getText() : "";

        this.classes[this.activeContextName].methods.push(`${visibility} ${name}(${paramsStr})`);
    }

    enterFieldDeclaration(ctx) {
        if (!this.activeContextName) return;

        const typeCtx = ctx.unannType();
        if (!typeCtx) return;
        const type = typeCtx.getText();

        // Extract directly from the grammar rule
        const modifiers = ctx.fieldModifier ? ctx.fieldModifier() : [];
        const visibility = this.getVisibility(modifiers);

        // HAS-A Composition Relationship
        if (!this.ignoreTypes.has(type)) {
            // Check if it's an array type (e.g., Room[]) and clean the brackets for the relationship diagram
            const cleanType = type.replace(/\[\]/g, '');
            if (!this.ignoreTypes.has(cleanType)) {
                this.relationships.push(`${this.activeContextName} *-- ${cleanType}`);
            }
        }

        const declaratorList = ctx.variableDeclaratorList();
        if (declaratorList) {
            const declarators = declaratorList.variableDeclarator();
            declarators.forEach(decl => {
                const variableName = decl.variableDeclaratorId().getText();
                this.classes[this.activeContextName].fields.push(`${visibility} ${variableName}: ${type}`);
            });
        }
    }

    enterMethodDeclaration(ctx) {
        if (!this.activeContextName) return;

        const modifiers = ctx.methodModifier ? ctx.methodModifier() : [];
        const visibility = this.getVisibility(modifiers);

        const header = ctx.methodHeader();
        if (!header) return;

        const returnType = header.result().getText();

        const methodDeclarator = header.methodDeclarator();
        const methodName = methodDeclarator.Identifier().getText();

        const formalParamsList = methodDeclarator.formalParameterList();
        const paramsStr = formalParamsList ? formalParamsList.getText() : "";

        // Check if abstract (adds * for mermaid italics)
        // Note: All interface methods are inherently abstract in standard UML
        const isAbstract = modifiers.some(m => m.getText() === 'abstract') || this.classes[this.activeContextName].type === 'interface';

        let methodDecl = `${visibility} ${methodName}(${paramsStr}) ${returnType}`;
        if (isAbstract) {
            methodDecl += "*";
        }

        this.classes[this.activeContextName].methods.push(methodDecl);
    }

    getVisibility(modifiers) {
        if (!modifiers || modifiers.length === 0) return '~'; // Package-private default

        const modText = modifiers.map(m => m.getText()).join(' ');
        if (modText.includes('public')) return '+';
        if (modText.includes('protected')) return '#';
        if (modText.includes('private')) return '-';
        return '~';
    }
}

export default JavaToMermaidListener;