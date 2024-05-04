import { Monaco } from "@monaco-editor/react";
import { languages } from "monaco-editor";

export const defaultPlumeCode = `// Welcome to the Plume Playground!
println("Hello, world!")`;

export function setupLanguage(monaco: Monaco) {
  const lang = monaco.languages;

  lang.register({ id: 'plume' });

  const pairs: languages.CharacterPair[] = [['{', '}'], ['[', ']'], ['(', ')'], ['"', '"'], ["'", "'"]];

  lang.setLanguageConfiguration('plume', {
    autoClosingPairs: [
      { close: '}', open: '{' },
      { close: ']', open: '[' },
      { close: ')', open: '(' },
      { close: '"', open: '"' },
      { close: '\'', open: '\'' },
      { close: '<', open: '>' },
    ],
    brackets: pairs,
    colorizedBracketPairs: pairs,
    comments: {
      blockComment: ['/*', '*/'],
      lineComment: '//'
    },
    wordPattern: /(-?\d*\.\d\w*)|([^\[\{\}\]\(\)\'\"\s]+)/g,
  });

  lang.setMonarchTokensProvider('plume', {
    brackets: [
      { open: '{', close: '}', token: 'delimiter.curly' },
      { open: '[', close: ']', token: 'delimiter.square' },
      { open: '(', close: ')', token: 'delimiter.parenthesis' },
      { open: '<', close: '>', token: 'delimiter.angle' },
    ],

    operators: [
      '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '+', '-', '*', '/'
    ],

    keywords: [
      "in"
      , "if"
      , "else"
      , "require"
      , "switch"
      , "fn"
      , "case"
      , "return"
      , "extend"
      , "native"
      , "type"
      , "infix"
      , "prefix"
      , "postfix"
      , "infixl"
      , "infixr"
      , "mut"
    ],

    typeKeywords: [
      "int"
      , "str"
      , "char"
      , "float"
      , "bool"
      , "unit"
    ],

    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    tokenizer: {
      root: [
        // Function definition
        [/(fn)(\s+)(\w+)(\()/, ['keyword', 'white', 'function', 'delimiter.parenthesis']],
        [/(fn)(\s+)(\()/, ['keyword', 'white', 'delimiter.parenthesis']],
        [/(fn)(\s+)(\w+)/, ['keyword', 'white', 'function']],

        [/(\w+)(\()/, ['function', 'delimiter.parenthesis']],
        
        [/\?/, 'keyword'],

        [/[a-z_$][\w$]*/, {
          cases: {
            '@typeKeywords': 'interface',
            '@keywords': 'keyword',
            '@default': 'variable'
          }
        }],

        { include: '@whitespace' },

        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, 'operator'],

        [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
        [/\d+/, 'number'],

        [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

        [/'[^\\']'/, 'string'],
        [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
        [/'/, 'string.invalid']
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'],    // nested comment
        ["\\*/", 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],

      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],
      ],
    },
  })
}