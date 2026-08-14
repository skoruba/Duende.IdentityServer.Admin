import { CodeBlock, CodeBlockStep } from "@/components/CodeBlock/CodeBlock";
import { Tip } from "@/components/Tip/Tip";
import { Warning } from "@/components/Warning/Warning";
import { SnippetDocument, SnippetMessage } from "@/lib/snippets/dotnetSnippets";
import { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";

const InlineCode = ({ children }: { children?: ReactNode }) => (
  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
    {children}
  </code>
);

const SnippetMessageText = ({ message }: { message: SnippetMessage }) => (
  <Trans
    i18nKey={message.key as never}
    values={message.values}
    components={{ code: <InlineCode /> }}
  />
);

type SnippetStepsProps = {
  document: SnippetDocument;
};

/** Renders a generated snippet document as numbered steps. */
export const SnippetSteps = ({ document }: SnippetStepsProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {document.steps.map((step, index) => (
        <CodeBlockStep
          key={step.id}
          step={index + 1}
          title={t(step.titleKey as never)}
          description={
            step.descriptionKey ? t(step.descriptionKey as never) : undefined
          }
        >
          {step.blocks.map((block) => (
            <CodeBlock
              key={block.id}
              code={block.code}
              language={block.language}
              title={block.fileName}
              downloadFileName={
                block.isDownloadable ? block.fileName : undefined
              }
            />
          ))}

          {step.warnings?.map((warning) => (
            <Warning key={warning.key}>
              <SnippetMessageText message={warning} />
            </Warning>
          ))}

          {step.notes?.map((note) => (
            <Tip key={note.key}>
              <SnippetMessageText message={note} />
            </Tip>
          ))}
        </CodeBlockStep>
      ))}
    </div>
  );
};
