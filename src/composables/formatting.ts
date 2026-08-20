import MarkdownIt, { type PluginWithParams } from "markdown-it";
import MarkdownItContainer from "markdown-it-container";

// Remember old renderer, if overridden, or proxy to default renderer

const md = new MarkdownIt();
// @types/markdown-it-container still resolves MarkdownIt through its CommonJS
// declaration entrypoint, while markdown-it's ESM types resolve the default export.
// The runtime plugin contract is unchanged; bridge the duplicate type identities here.
md.use(MarkdownItContainer as unknown as PluginWithParams, "scroll-step");

// from https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
const defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  // If you are sure other plugins can't add `target` - drop check below
  const aIndex = tokens[idx].attrIndex("target");

  if (aIndex < 0) {
    tokens[idx].attrPush(["target", "_blank"]); // add new attribute
  } else {
    tokens[idx].attrs![aIndex]![1] = "_blank"; // replace value of existing attr
  }

  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self);
};

export function renderMarkdown(text: string) {
  return md.render(text);
}
