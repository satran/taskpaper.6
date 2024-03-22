import { simpleMode } from "@codemirror/legacy-modes/mode/simple-mode";
import { Tag, tags } from "@lezer/highlight";

// var searchTag = Tag.define(tags.function);
// var tagTag = Tag.define(tags.keyword);


export const taskpaper = simpleMode({
    start: [
        //{ regex: /(\s*)#+ (.*)$/, token: "header", sol: true, indent: true },
        { regex: /(\s*)(.*):$/, token: "heading", sol: true, indent: true },
       // { regex: /(\s*)(\- )(.*)/, token: [null, "special", null], sol: true },
	    { regex: /(\s*)(x .*)/, token: [null, "done"], sol: true },
        { regex: /search\(.*\)/, token: "keyword" },
        { regex: /#[a-zA-Z_\-\.\/]+/, token: "tagName"},
        { regex: /@[a-zA-Z_\-\.\/\(\)0-9]+/, token: "keyword"},
        { regex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, token: "url" },
    ],
    // The meta property contains global information about the mode. It
    // can contain properties like lineComment, which are supported by
    // all modes, and also directives like dontIndentStates, which are
    // specific to simple modes.
    meta: {
        dontIndentStates: ["comment"],
        lineComment: "//"
    },
    languageData: {
        name: "taskpaper",
        indentOnInput: /^\s*\}$/,
        commentTokens: {line: "//"}
    }
});
