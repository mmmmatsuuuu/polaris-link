"use client";

import { Select } from "@radix-ui/themes";
import CodeBlockLowlight, { CodeBlockLowlightOptions } from "@tiptap/extension-code-block-lowlight";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { all, createLowlight } from "lowlight";
import css from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/github-dark.css";

type CodeLanguage = {
  value: string;
  label: string;
};

export const codeLanguages: CodeLanguage[] = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
];

export type LowlightInstance = ReturnType<typeof createLowlight>;

export const createLowlightInstance = (): LowlightInstance => {
  const lowlight = createLowlight(all);
  lowlight.register("html", html);
  lowlight.register("css", css);
  lowlight.register("javascript", javascript);
  lowlight.register("js", javascript);
  lowlight.register("python", python);
  return lowlight;
};

type CodeBlockComponentProps = NodeViewProps & {
  extension: {
    options: {
      languageOptions: CodeLanguage[];
    };
  };
};

const CodeBlockComponent = ({
  node,
  updateAttributes,
  editor,
  extension,
}: CodeBlockComponentProps) => {
  const languageOptions = extension.options.languageOptions;
  const languageValue = node.attrs.language || "plain";
  const label =
    languageOptions.find((option: any) => option.value === languageValue)?.label ??
    "Plain";

  return (
    <NodeViewWrapper className="tiptap-code-block">
      <div className="tiptap-code-header">
        {editor.isEditable ? (
          <Select.Root
            value={languageValue}
            onValueChange={(lang) =>
              updateAttributes({ language: lang === "plain" ? null : lang })
            }
          >
            <Select.Trigger placeholder="言語を選択" />
            <Select.Content>
              <Select.Item value="plain">Plain</Select.Item>
              {languageOptions.map((option: any) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        ) : (
          <span className="tiptap-code-language">{label}</span>
        )}
      </div>
      <pre>
        <NodeViewContent className={`language-${languageValue}`} />
      </pre>
    </NodeViewWrapper>
  );
};

export const createCodeBlockExtension = (
  lowlight: LowlightInstance,
  languageOptions: CodeLanguage[] = codeLanguages
) =>
  CodeBlockLowlight.extend({
    addOptions() {
      const parentOptions = (this.parent?.() ?? {}) as CodeBlockLowlightOptions;
      return {
        ...parentOptions,
        lowlight: parentOptions.lowlight ?? lowlight,
        languageOptions,
      } as CodeBlockLowlightOptions & { languageOptions: CodeLanguage[] };
    },
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent);
    },
  }).configure({ lowlight });
