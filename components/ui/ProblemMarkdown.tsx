'use client';

import React from 'react';

function inlineParts(value: string) {
  return value.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`} className="font-bold text-slate-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={`${part}-${index}`} className="rounded bg-slate-950 px-1.5 py-0.5 font-mono text-amber-300">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={`${part}-${index}`} className="italic text-slate-100">{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

interface ProblemMarkdownProps {
  content: string;
  className?: string;
}

export function ProblemMarkdown({ content, className = '' }: ProblemMarkdownProps) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc space-y-1 pl-5 text-slate-300">
        {listItems.map((item, index) => <li key={`${item}-${index}`}>{inlineParts(item)}</li>)}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.slice(2));
      return;
    }
    flushList();
    if (!trimmed) {
      blocks.push(<div key={`space-${index}`} className="h-2" aria-hidden="true" />);
    } else if (trimmed.startsWith('### ')) {
      blocks.push(<h4 key={`heading-${index}`} className="pt-2 text-sm font-bold text-white">{inlineParts(trimmed.slice(4))}</h4>);
    } else if (trimmed.startsWith('## ')) {
      blocks.push(<h3 key={`heading-${index}`} className="pt-2 text-base font-bold text-white">{inlineParts(trimmed.slice(3))}</h3>);
    } else {
      blocks.push(<p key={`paragraph-${index}`} className="leading-7 text-slate-300">{inlineParts(line)}</p>);
    }
  });
  flushList();

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
}
