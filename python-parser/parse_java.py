import sys
import json
import javalang
from javalang.tree import ClassDeclaration, InterfaceDeclaration, FieldDeclaration, MethodDeclaration, BasicType, ReferenceType

def get_visibility(modifiers):
    if 'public' in modifiers:
        return '+'
    elif 'protected' in modifiers:
        return '#'
    elif 'private' in modifiers:
        return '-'
    return '~'  # package-private

def format_type(type_node):
    if type_node is None:
        return 'void'
    if isinstance(type_node, BasicType):
        # e.g., int, double, void
        dimensions = '[]' * len(type_node.dimensions)
        return type_node.name + dimensions
    elif isinstance(type_node, ReferenceType):
        # e.g., String, Shape
        dimensions = '[]' * len(type_node.dimensions)
        # generic arguments could be handled here if needed, keeping simple for SYSC2004
        return type_node.name + dimensions
    return str(type_node)

def parse_java_file(file_content):
    tree = javalang.parse.parse(file_content)
    
    classes = {}
    relationships = []

    IGNORE_TYPES = {
        'String', 'Integer', 'Double', 'Boolean', 'Character', 'Byte', 'Short', 'Long', 'Float',
        'Object', 'Class', 'List', 'ArrayList', 'LinkedList', 'Map', 'HashMap', 'TreeMap',
        'Set', 'HashSet', 'TreeSet', 'Collection', 'Iterator', 'Random', 'Scanner', 'File',
        'InputStream', 'OutputStream', 'Reader', 'Writer', 'Exception', 'Throwable', 'Error',
        'RuntimeException', 'Thread', 'Runnable', 'Math', 'Arrays', 'Collections', 'Stack'
    }
    
    for path, node in tree.filter(ClassDeclaration):
        class_name = node.name
        classes[class_name] = {'type': 'class', 'fields': [], 'methods': []}
        
        # Inheritance
        if node.extends:
            super_class = node.extends.name
            relationships.append(f"{super_class} <|-- {class_name}")
            
        # Implementation (Interfaces)
        if node.implements:
            for interface in node.implements:
                relationships.append(f"{interface.name} <|.. {class_name}")
                
        # Fields (Attributes)
        for field in node.fields:
            if isinstance(field, FieldDeclaration):
                visibility = get_visibility(field.modifiers)
                field_type = format_type(field.type)
                
                # Composition / Aggregation extraction
                # If a field is a ReferenceType, it HAS-A relationship
                if isinstance(field.type, ReferenceType) and field.type.name not in IGNORE_TYPES:
                     relationships.append(f"{class_name} *-- {field.type.name}")

                for declarator in field.declarators:
                    field_name = declarator.name
                    # Note UML format: visibility name: type
                    classes[class_name]['fields'].append(f"{visibility} {field_name}: {field_type}")
                    
        # Methods (Operations)
        for method in node.methods:
            if isinstance(method, MethodDeclaration):
                visibility = get_visibility(method.modifiers)
                return_type = format_type(method.return_type)
                method_name = method.name
                
                params = []
                for p in method.parameters:
                    param_type = format_type(p.type)
                    params.append(f"{p.name}: {param_type}")
                
                params_str = ", ".join(params)
                
                # Abstract methods are italicized in UML; in mermaid we can use \* \*. 
                # SYSC2004 reqs: Italics for abstract method.
                # Mermaid supports abstract methods using `*`
                is_abstract = 'abstract' in method.modifiers
                method_decl = f"{visibility} {method_name}({params_str}) {return_type}"
                if is_abstract:
                    method_decl += "*"  # Mermaid class diagram syntax for abstract method
                    
                classes[class_name]['methods'].append(method_decl)
                
        # Constructors
        for constructor in node.constructors:
             visibility = get_visibility(constructor.modifiers)
             params = []
             for p in constructor.parameters:
                 param_type = format_type(p.type)
                 params.append(f"{p.name}: {param_type}")
             params_str = ", ".join(params)
             classes[class_name]['methods'].append(f"{visibility} {class_name}({params_str})")

    # Handle interfaces similarly
    for path, node in tree.filter(InterfaceDeclaration):
        interface_name = node.name
        classes[interface_name] = {'type': 'interface', 'fields': [], 'methods': []}
        relationships.append(f"class {interface_name} {{ \n  <<interface>>\n}}")
        if node.extends:
            for ext in node.extends:
                relationships.append(f"{ext.name} <|-- {interface_name}")
        for method in node.methods:
            if isinstance(method, MethodDeclaration):
                 visibility = get_visibility(method.modifiers)
                 return_type = format_type(method.return_type)
                 method_name = method.name
                 params = []
                 for p in method.parameters:
                     param_type = format_type(p.type)
                     params.append(f"{p.name}: {param_type}")
                 params_str = ", ".join(params)
                 classes[interface_name]['methods'].append(f"{visibility} {method_name}({params_str}) {return_type}*")
                 
    return classes, relationships

def generate_mermaid(classes, relationships):
    mermaid_lines = ["classDiagram"]
    
    for class_name, data in classes.items():
        if data['type'] == 'interface':
            # Interface definition handled mostly via <<interface>> annotation
            pass
        mermaid_lines.append(f"class {class_name} {{")
        for field in data['fields']:
            mermaid_lines.append(f"  {field}")
        for method in data['methods']:
            mermaid_lines.append(f"  {method}")
        mermaid_lines.append("}")
        
    for rel in relationships:
        if rel not in mermaid_lines: # avoid duplicate relationships
            # Check if relationship involves an unknown class by splitting
            # Example: "TransporterRoom *-- Room" -> "TransporterRoom", "*--", "Room"
            parts = rel.split()
            if len(parts) == 3:
                left_class, arrow, right_class = parts[0], parts[1], parts[2]
                # Only draw relationship if both classes are known (in the uploaded files)
                if left_class in classes and right_class in classes:
                    mermaid_lines.append(rel)
            else:
                 mermaid_lines.append(rel) # Interfaces or generic statements
        
    return "\n".join(mermaid_lines)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Read file from args
        try:
             with open(sys.argv[1], 'r', encoding='utf-8') as f:
                 content = f.read()
             classes, relationships = parse_java_file(content)
             print(generate_mermaid(classes, relationships))
        except Exception as e:
             print(f"Error parsing {sys.argv[1]}: {e}", file=sys.stderr)
    else:
        # Read from stdin
        content = sys.stdin.read()
        try:
            file_contents = json.loads(content)
            if not isinstance(file_contents, list):
                file_contents = [content]
        except json.JSONDecodeError:
            file_contents = [content]

        all_classes = {}
        all_relationships = []

        for file_content in file_contents:
            try:
                classes, relationships = parse_java_file(file_content)
                all_classes.update(classes)
                for rel in relationships:
                    if rel not in all_relationships:
                        all_relationships.append(rel)
            except Exception as e:
                print(f"Error parsing file: {e}", file=sys.stderr)

        print(generate_mermaid(all_classes, all_relationships))
