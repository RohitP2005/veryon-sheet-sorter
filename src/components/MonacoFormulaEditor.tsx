import Editor, { type Monaco } from "@monaco-editor/react";

// Mirrors the whitelisted Excel-style functions in the backend's formula_parser.py.
const FORMULA_FUNCTIONS = [
  { name: "IF", detail: "IF(condition, value_if_true, value_if_false)" },
  { name: "IFERROR", detail: "IFERROR(value, value_if_error)" },
  { name: "AND", detail: "AND(condition1, condition2, ...)" },
  { name: "OR", detail: "OR(condition1, condition2, ...)" },
  { name: "NOT", detail: "NOT(condition)" },
  { name: "ROUND", detail: "ROUND(number, digits)" },
  { name: "ROUNDUP", detail: "ROUNDUP(number, digits)" },
  { name: "ROUNDDOWN", detail: "ROUNDDOWN(number, digits)" },
  { name: "ABS", detail: "ABS(number)" },
  { name: "INT", detail: "INT(number)" },
  { name: "TRUNC", detail: "TRUNC(number, [digits])" },
  { name: "SQRT", detail: "SQRT(number)" },
  { name: "POWER", detail: "POWER(number, power)" },
  { name: "MOD", detail: "MOD(number, divisor)" },
  { name: "MIN", detail: "MIN(number1, number2, ...)" },
  { name: "MAX", detail: "MAX(number1, number2, ...)" },
  { name: "SUM", detail: "SUM(number1, number2, ...)" },
  { name: "AVERAGE", detail: "AVERAGE(number1, number2, ...)" },
  { name: "CONCATENATE", detail: "CONCATENATE(text1, text2, ...)" },
  { name: "LEFT", detail: "LEFT(text, [num_chars])" },
  { name: "RIGHT", detail: "RIGHT(text, [num_chars])" },
  { name: "MID", detail: "MID(text, start_num, num_chars)" },
  { name: "LEN", detail: "LEN(text)" },
  { name: "UPPER", detail: "UPPER(text)" },
  { name: "LOWER", detail: "LOWER(text)" },
  { name: "TRIM", detail: "TRIM(text)" },
  { name: "SUBSTITUTE", detail: "SUBSTITUTE(text, old_text, new_text, [instance_num])" },
];

export default function MonacoFormulaEditor({
  value,
  columns,
  onChange,
}: {
  value: string;
  columns: string[];
  onChange: (value: string) => void;
}) {
  function handleMount(monaco: Monaco) {
    monaco.languages.registerCompletionItemProvider("plaintext", {
      triggerCharacters: ["{"],
      provideCompletionItems: (
        model: import("monaco-editor").editor.ITextModel,
        position: import("monaco-editor").Position,
      ) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Inside an unclosed {{ ... }}, suggest columns; otherwise suggest functions.
        const textBeforeCursor = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });
        const insidePlaceholder = textBeforeCursor.lastIndexOf("{{") > textBeforeCursor.lastIndexOf("}}");

        if (insidePlaceholder) {
          return {
            suggestions: columns.map((column) => ({
              label: `{{${column}}}`,
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: `{{${column}}}`,
              detail: "Source column",
              range,
            })),
          };
        }

        return {
          suggestions: FORMULA_FUNCTIONS.map((fn) => ({
            label: fn.name,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: `${fn.name}(`,
            detail: fn.detail,
            range,
          })),
        };
      },
    });
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Editor
        height="90px"
        defaultLanguage="plaintext"
        value={value}
        beforeMount={handleMount}
        onChange={(next) => onChange(next ?? "")}
        options={{
          minimap: { enabled: false },
          lineNumbers: "off",
          fontSize: 13,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          folding: false,
          overviewRulerLanes: 0,
          renderLineHighlight: "none",
          quickSuggestions: { other: true, comments: false, strings: true },
        }}
      />
    </div>
  );
}
