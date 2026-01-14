/*! markdown-it-task-lists 2.1.1 https://github.com/revin/markdown-it-task-lists#readme by Revin Guillen @license ISC */
"use strict";
var markdownitTaskLists = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => taskLists
  });
  var disableCheckboxes = true;
  var useLabelWrapper = false;
  var useLabelAfter = false;
  function taskLists(md, options) {
    if (options) {
      disableCheckboxes = !options.enabled;
      useLabelWrapper = !!options.label;
      useLabelAfter = !!options.labelAfter;
    }
    md.core.ruler.after("inline", "github-task-lists", function(state) {
      const tokens = state.tokens;
      const TokenConstructor = tokens[0]?.constructor;
      for (let i = 2; i < tokens.length; i++) {
        if (isTodoItem(tokens, i)) {
          todoify(tokens[i], TokenConstructor);
          attrSet(tokens[i - 2], "class", "task-list-item" + (!disableCheckboxes ? " enabled" : ""));
          attrSet(tokens[parentToken(tokens, i - 2)], "class", "contains-task-list");
        }
      }
    });
  }
  function attrSet(token, name, value) {
    const index = token.attrIndex(name);
    const attr = [name, value];
    if (index < 0) {
      token.attrPush(attr);
    } else if (token.attrs) {
      token.attrs[index] = attr;
    }
  }
  function parentToken(tokens, index) {
    const targetLevel = tokens[index].level - 1;
    for (let i = index - 1; i >= 0; i--) {
      if (tokens[i].level === targetLevel) {
        return i;
      }
    }
    return -1;
  }
  function isTodoItem(tokens, index) {
    return isInline(tokens[index]) && isParagraph(tokens[index - 1]) && isListItem(tokens[index - 2]) && startsWithTodoMarkdown(tokens[index]);
  }
  function todoify(token, TokenConstructor) {
    token.children.unshift(makeCheckbox(token, TokenConstructor));
    token.children[1].content = token.children[1].content.slice(3);
    token.content = token.content.slice(3);
    if (useLabelWrapper) {
      if (useLabelAfter) {
        token.children.pop();
        const id = "task-item-" + Math.ceil(Math.random() * (1e4 * 1e3) - 1e3);
        token.children[0].content = token.children[0].content.slice(0, -1) + ' id="' + id + '">';
        token.children.push(afterLabel(token.content, id, TokenConstructor));
      } else {
        token.children.unshift(beginLabel(TokenConstructor));
        token.children.push(endLabel(TokenConstructor));
      }
    }
  }
  function makeCheckbox(token, TokenConstructor) {
    const checkbox = new TokenConstructor("html_inline", "", 0);
    const disabledAttr = disableCheckboxes ? ' disabled="" ' : "";
    if (token.content.indexOf("[ ] ") === 0) {
      checkbox.content = '<input class="task-list-item-checkbox"' + disabledAttr + 'type="checkbox">';
    } else if (token.content.indexOf("[x] ") === 0 || token.content.indexOf("[X] ") === 0) {
      checkbox.content = '<input class="task-list-item-checkbox" checked=""' + disabledAttr + 'type="checkbox">';
    }
    return checkbox;
  }
  function beginLabel(TokenConstructor) {
    const token = new TokenConstructor("html_inline", "", 0);
    token.content = "<label>";
    return token;
  }
  function endLabel(TokenConstructor) {
    const token = new TokenConstructor("html_inline", "", 0);
    token.content = "</label>";
    return token;
  }
  function afterLabel(content, id, TokenConstructor) {
    const token = new TokenConstructor("html_inline", "", 0);
    token.content = '<label class="task-list-item-label" for="' + id + '">' + content + "</label>";
    token.attrs = [["for", id]];
    return token;
  }
  function isInline(token) {
    return token.type === "inline";
  }
  function isParagraph(token) {
    return token.type === "paragraph_open";
  }
  function isListItem(token) {
    return token.type === "list_item_open";
  }
  function startsWithTodoMarkdown(token) {
    return token.content.indexOf("[ ] ") === 0 || token.content.indexOf("[x] ") === 0 || token.content.indexOf("[X] ") === 0;
  }
  return __toCommonJS(index_exports);
})();
