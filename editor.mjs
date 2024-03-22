import {EditorView, basicSetup} from "codemirror"
import {taskpaper} from "./taskpaper"
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { bracketMatching, defaultHighlightStyle, foldService, foldGutter, foldKeymap, foldEffect, indentOnInput, syntaxHighlighting, StreamLanguage } from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorState } from '@codemirror/state'
import { crosshairCursor, drawSelection, dropCursor, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, rectangularSelection } from '@codemirror/view'

const foldingOnIndent = foldService.of((state, from, to) => {
  const line = state.doc.lineAt(from) // First line
  const lines = state.doc.lines // Number of lines in the document
  const indent = line.text.search(/\S|$/) // Indent level of the first line
  let foldStart = from // Start of the fold
  let foldEnd = to // End of the fold

  // Check the next line if it is on a deeper indent level
  // If it is, check the next line and so on
  // If it is not, go on with the foldEnd
  let nextLine = line
  while (nextLine.number < lines) {
      nextLine = state.doc.line(nextLine.number + 1) // Next line
      const nextIndent = nextLine.text.search(/\S|$/) // Indent level of the next line

      // If the next line is on a deeper indent level, add it to the fold
      if (nextIndent > indent) {
          foldEnd = nextLine.to // Set the fold end to the end of the next line
      } else {
          break // If the next line is not on a deeper indent level, stop
      }
  }

  // If the fold is only one line, don't fold it
  if (state.doc.lineAt(foldStart).number === state.doc.lineAt(foldEnd).number) {
      return null
  }

  // Set the fold start to the end of the first line
  // With this, the fold will not include the first line
  foldStart = line.to

  // Return a fold that covers the entire indent level
  return { from: foldStart, to: foldEnd }
})

let editor = new EditorView({
  extensions: [
    foldingOnIndent,
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorView.lineWrapping,
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
    ]),    
    StreamLanguage.define(taskpaper)
  ],
  parent: document.querySelector("#container")
});

window.deb = function () {
  editor.dispatch({effects: foldEffect.of({from: 5, to: 10})});
}

let searchInput = document.getElementById('search');

searchInput.addEventListener("keypress", function(e) {
  if (e.code !== "Enter") return;
  let query = searchInput.value.trim();
  if (query === "") {
      showAll(cm);
      return;
  }
  filter(cm, query);
});

function showAll(editor) {
  let cursor = editor.getCursor();
  editor.doc.getAllMarks().forEach(marker => marker.clear());
  editor.focus();
  editor.setCursor({ line: cursor.line, ch: cursor.ch }, { scroll: true });
}

function getDepth(line) {
  let depth = 0;
  let matched = line.match(/^\s*/);
  if (matched !== null && matched.length === 1) {
      depth = matched[0].length;
  }
  return depth;
}

function getHeader(line) {
  if (!line.match(/^\s*\#+ /)) return { header: false, depth: 0 };
  return { header: true, depth: getDepth(line) };
}

function match(line, query) {
  let today = new Date().toISOString().split('T')[0];
  query = query.replace("@today", today);

  let parts = query.split(" ");
  for (let part of parts) {
      let matched = line.match(part);
      if (matched === null || matched.length == 0) return false;
  }
  return true;
}

function filter(editor, query) {
  showAll(editor);
  let headers = [];
  let doc = editor.getDoc();
  doc.eachLine((l) => {
      let line = l.text;
      let depth = getDepth(line);
      for (let j = headers.length - 1; j >= 0; j--) {
          if (headers[j].depth >= depth) {
              headers.pop();
              continue;
          } else {
              break;
          }
      }
      let header = getHeader(line);
      let lineNo = l.lineNo();
      if (!match(line, query)) {
          let mark = editor.markText({ line: lineNo, ch: 0 }, { line: lineNo }, { inclusiveRight: true, inclusiveLeft: true, collapsed: true, clearWhenEmpty: false });
          if (header.header) {
              headers.push({ line: lineNo, mark: mark, depth: header.depth, shown: false });
          }
      } else {
          for (let j = 0; j < headers.length; j++) {
              if (headers[j].shown) {
                  continue;
              }
              headers[j].mark.clear();
              headers[j].shown = true;
          }
      }
  });
}

window.editor = editor;