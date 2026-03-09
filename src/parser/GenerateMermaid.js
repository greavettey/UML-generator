export default function generateMermaid(classes, relationships) {
    let lines = ["classDiagram"];

    Object.entries(classes).forEach(([className, classInfo]) => {
        lines.push(`class ${className} {`);
        classInfo.fields.forEach(field => { lines.push(` ${field}`); });
        classInfo.methods.forEach(method => { lines.push(` ${method}`); });
        lines.push("}");
    }); 

    relationships.forEach(rel => {
        const parts = rel.split(" "); 
        if(classes[parts[0]] && classes[parts[2]]) {
            lines.push(rel);
        }
    });

    return lines.join("\n"); 
}