


// Syntax rules for basic languages
export const languages = {
    javascript: {
      syntax:{
        keyword: /\b(function|return|var|let|const|if|else|for|while|class|import|export|new|throw|try|catch)\b/g,
        string: /("[^"]*"|'[^']*'|`[^`]*?`)/g,
        number: /\b\d+(\.\d+)?\b/g,
        comment: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
        operator: /[+\-*\/=%!]/g,
        convention: /[:;{}()]/g,
      },
      reservedWords:["function", "var", "let", "const", "if", "else", "for", "while", "return"],
      tokenizer: /([a-zA-Z_$][a-zA-Z0-9_$]*)|([0-9]+(?:\.[0-9]+)?)|(["'][^"']*?["'])|(`(?:[^`\\$]|\\.|(\$\{(?:[^{}\\]|\\.|{[^}]*})*\}))*`)|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|([+\-*/%=&|^!<>]=?|[~?:])|([{}()[\].,;])|(["'])|(\\)|(\/(?![*\/]))|(\s+)/g
    },
    python: {
      syntax:{
        keyword: /\b(def|return|if|else|elif|for|while|class|import|from|as|try|except|finally)\b/g,
        string: /("[^"]*"|'[^']*')/g,
        number: /\b\d+(\.\d+)?\b/g,
        comment: /(#.*$)/gm,
        operator: /[+\-*\/=%!]/g,
      },
      reservedWords:[],
      tokenizer: /([a-zA-Z_][a-zA-Z0-9_]*)|([0-9]+(?:\.[0-9]+)?)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|'''[\s\S]*?'''|"""[\s\S]*?""")|(#.*)|([+\-*/%=&|^!<>]=?|[~?:])|([{}()[\].,;:])|(["'])|(\s+)/g
    },
    html: {
      syntax:{
        keyword: /(&lt;\/?[a-z]+&gt;)/g,
        string: /("[^"]*"|'[^']*')/g,
        comment: /(<!--[\s\S]*?-->)/g,
      },
      reservedWords:[],
      tokenizer: /(<\/?[a-zA-Z][a-zA-Z0-9\-]*\s*[^>]*>)|("[^"]*"|'[^']*')|(\s+)/g
    },
    css: {
      syntax:{
        keyword: /\b(display|flex|grid|position|relative|absolute|margin|padding)\b/g,
        string: /("[^"]*"|'[^']*')/g,
        number: /\b\d+(\.\d+)?\b/g,
        comment: /(\/\*[\s\S]*?\*\/)/g,
        operator: /[:;{}]/g,
      },
      reservedWords:[],
      tokenizer: /([a-zA-Z_\-][a-zA-Z0-9_\-]*)|([0-9]+(?:\.[0-9]+)?(px|em|rem|%)?)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\/\*[\s\S]*?\*\/)|([{}()[\].,:;])|([+\-*/%=&|^!<>]=?)|(\s+)/g
    }
  };
  