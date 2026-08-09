import Editor, { type Monaco } from "@monaco-editor/react";

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
        return {
          suggestions: columns.map((column) => ({
            label: `{{${column}}}`,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: `{{${column}}}`,
            detail: "Source column",
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