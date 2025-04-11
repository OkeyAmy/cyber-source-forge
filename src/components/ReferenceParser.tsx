import React from 'react';
import ReactMarkdown from 'react-markdown';
import { SourceType } from '@/types/chatTypes';
import { Shield, ExternalLink, AlertCircle } from 'lucide-react';

interface ReferenceParserProps {
  content: string;
  sources: SourceType[];
  className?: string;
}

const ReferenceParser: React.FC<ReferenceParserProps> = ({ 
  content, 
  sources,
  className
}) => {
  // Enhanced function to process text and replace references with links
  const parseReferences = (text: string) => {
    if (!text) return text;
    
    // Return early if no sources are available, but still render the text
    if (!sources || sources.length === 0) {
      return text;
    }
    
    // Improved regex to find references like [1], [25], etc.
    // This handles both single and double-digit references
    const regex = /\[(\d+)\]/g;
    
    let lastIndex = 0;
    const parts = [];
    let match;
    
    // Find all matches and process them
    while ((match = regex.exec(text)) !== null) {
      // Add the text before the reference
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const refNumber = parseInt(match[1], 10);
      
      // First try to find a source with exact matching num
      let source = sources.find(s => s.num === refNumber);
      
      // If not found, try a more lenient approach - find first source that might match
      if (!source && sources.length > 0) {
        // If the reference index is within the sources array bounds, use that source
        if (refNumber > 0 && refNumber <= sources.length) {
          source = sources[refNumber - 1]; // Adjust for 0-based array indexing
        } else {
          // Last resort - just use the first source if the reference doesn't match any source
          console.warn(`Reference [${refNumber}] not found in sources, using fallback`);
          source = sources[0];
        }
      }
      
      if (source) {
        // Add a clickable reference with enhanced styling and verified indicator
        parts.push(
          <a 
            key={`ref-${match.index}`}
            href={source.link}
            target="_blank"
            rel="noopener noreferrer"
            title={`${source.title}${source.verified ? ' (Verified)' : ' (Unverified)'}`}
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
              source.verified 
                ? 'bg-cyber-green/20 text-cyber-green hover:bg-cyber-green/30' 
                : 'bg-cyber-magenta/20 text-cyber-magenta hover:bg-cyber-magenta/30'
            } transition-colors mx-0.5`}
            onClick={(e) => {
              e.stopPropagation();
              window.open(source.link, '_blank');
            }}
          >
            <span>{match[0]}</span>
          </a>
        );
      } else {
        // If source not found, keep the original text but make it clear it's missing
        parts.push(
          <span 
            key={`missing-ref-${match.index}`}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400"
            title="Source reference not found"
          >
            <span className="mr-1">{match[0]}</span>
            <AlertCircle className="h-3 w-3" />
          </span>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };
  
  // Process the content as markdown, but handle references specially
  const components = {
    // Custom component for paragraphs
    p: ({ children }: { children: React.ReactNode }) => {
      // If children is a string, process references
      if (typeof children === 'string') {
        return <p className="mb-4">{parseReferences(children)}</p>;
      }
      
      // If children is already an array (might contain other JSX elements)
      if (Array.isArray(children)) {
        return (
          <p className="mb-4">
            {children.map((child, i) => {
              if (typeof child === 'string') {
                return <React.Fragment key={i}>{parseReferences(child)}</React.Fragment>;
              }
              return <React.Fragment key={i}>{child}</React.Fragment>;
            })}
          </p>
        );
      }
      
      // Otherwise just render as is
      return <p className="mb-4">{children}</p>;
    },
    
    // Custom component for links
    a: ({ node, ...props }: any) => (
      <a 
        {...props} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-cyber-cyan hover:underline flex items-center inline"
      />
    ),
    
    // Custom component for code blocks
    code: ({ node, ...props }: any) => (
      <code 
        {...props} 
        className="bg-black/30 px-1 py-0.5 rounded text-cyber-magenta" 
      />
    ),
    
    // Custom component for preformatted text
    pre: ({ node, ...props }: any) => (
      <pre 
        {...props} 
        className="bg-black/30 p-4 rounded-md border border-white/10 overflow-x-auto my-4" 
      />
    ),
    
    // Custom component for headers
    h1: ({ children }: { children: React.ReactNode }) => {
      if (typeof children === 'string') {
        return <h1 className="text-xl font-bold mb-4 text-cyber-green">{parseReferences(children)}</h1>;
      }
      return <h1 className="text-xl font-bold mb-4 text-cyber-green">{children}</h1>;
    },
    
    h2: ({ children }: { children: React.ReactNode }) => {
      if (typeof children === 'string') {
        return <h2 className="text-lg font-bold mb-3 text-cyber-green">{parseReferences(children)}</h2>;
      }
      return <h2 className="text-lg font-bold mb-3 text-cyber-green">{children}</h2>;
    },
    
    h3: ({ children }: { children: React.ReactNode }) => {
      if (typeof children === 'string') {
        return <h3 className="text-md font-bold mb-2 text-cyber-green">{parseReferences(children)}</h3>;
      }
      return <h3 className="text-md font-bold mb-2 text-cyber-green">{children}</h3>;
    },
    
    // Custom component for lists
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>
    ),
    
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>
    ),
    
    li: ({ children }: { children: React.ReactNode }) => {
      if (typeof children === 'string') {
        return <li>{parseReferences(children)}</li>;
      }
      
      if (Array.isArray(children)) {
        return (
          <li>
            {children.map((child, i) => {
              if (typeof child === 'string') {
                return <React.Fragment key={i}>{parseReferences(child)}</React.Fragment>;
              }
              return <React.Fragment key={i}>{child}</React.Fragment>;
            })}
          </li>
        );
      }
      
      return <li>{children}</li>;
    }
  };
  
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ReferenceParser; 