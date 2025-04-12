import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SourceType } from '@/types/chatTypes';

interface MarkdownContentProps {
  content: string;
  sources?: SourceType[];
  onReferenceClick?: (source: SourceType) => void;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ 
  content, 
  sources = [], 
  onReferenceClick 
}) => {
  // Convert markdown content into React elements
  const processedContent = React.useMemo(() => {
    if (!content) return '';
    
    // Handle reference links like [1], [2], etc.
    const processedText = content.replace(
      /\[(\d+)\]/g, 
      (match, refNumber) => {
        const sourceIndex = parseInt(refNumber, 10) - 1;
        // Check if this reference number points to a valid source
        if (sources && sourceIndex >= 0 && sourceIndex < sources.length) {
          return `[${refNumber}](#ref-${refNumber})`;
        }
        return match;
      }
    );
    
    return processedText;
  }, [content, sources]);

  // Handle clicking on reference links
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const href = e.currentTarget.getAttribute('href');
    if (!href || !onReferenceClick) return;
    
    const refMatch = href.match(/#ref-(\d+)/);
    if (refMatch) {
      const refNumber = parseInt(refMatch[1], 10);
      const sourceIndex = refNumber - 1;
      if (sources && sourceIndex >= 0 && sourceIndex < sources.length) {
        onReferenceClick(sources[sourceIndex]);
      }
    } else {
      // External link, open in new tab
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom renderer for links to make references clickable
          a: ({ node, children, href, ...props }) => {
            const isReference = href?.startsWith('#ref-');
            
            return (
              <a
                href={href}
                onClick={handleLinkClick}
                className={isReference ? 'reference-link' : ''}
                {...props}
              >
                {children}
              </a>
            );
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent; 