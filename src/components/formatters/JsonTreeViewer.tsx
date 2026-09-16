import React, { useState, memo } from 'react';

interface JsonTreeViewerProps {
  data: unknown;
  name?: string;
  isLast?: boolean;
  initiallyExpanded?: boolean;
}

const JsonTreeViewerComponent: React.FC<JsonTreeViewerProps> = ({ 
  data, 
  name, 
  isLast = true,
  initiallyExpanded = false 
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const isObject = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);
  const isEmpty = isObject && Object.keys(data).length === 0;

  const toggleExpand = () => setExpanded(!expanded);

  const renderValue = (val: unknown) => {
    if (typeof val === 'string') {
      return <span className="text-yellow-300">&quot;{val}&quot;</span>;
    }
    if (typeof val === 'number' || typeof val === 'boolean') {
      return <span className="text-cyan-400">{String(val)}</span>;
    }
    if (val === null || val === undefined) {
      return <span className="text-gray-500 font-italic">null</span>;
    }
    return null;
  };

  if (!isObject) {
    return (
      <div className="font-mono text-sm leading-tight flex">
        {name && (
          <>
            <span className="text-purple-400">&quot;{name}&quot;</span>
            <span className="text-gray-400 mx-1">:</span>
          </>
        )}
        {renderValue(data)}
        {!isLast && <span className="text-gray-400">,</span>}
      </div>
    );
  }

  const keys = Object.keys(data);
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';

  if (isEmpty) {
    return (
      <div className="font-mono text-sm leading-tight flex">
        {name && (
          <>
            <span className="text-purple-400">&quot;{name}&quot;</span>
            <span className="text-gray-400 mx-1">:</span>
          </>
        )}
        <span className="text-gray-400">{bracketOpen}{bracketClose}</span>
        {!isLast && <span className="text-gray-400">,</span>}
      </div>
    );
  }

  return (
    <div className="font-mono text-sm leading-tight">
      <div className="flex cursor-pointer hover:bg-white/5 w-fit rounded pr-2" onClick={toggleExpand}>
        <span className="text-gray-500 w-4 inline-block text-center select-none">
          {expanded ? '-' : '+'}
        </span>
        {name && (
          <>
            <span className="text-purple-400">&quot;{name}&quot;</span>
            <span className="text-gray-400 mx-1">:</span>
          </>
        )}
        {!expanded && (
          <span className="text-gray-400">
            {bracketOpen} {isArray ? `${keys.length} items` : `${keys.length} keys`} {bracketClose}
            {!isLast && ','}
          </span>
        )}
        {expanded && <span className="text-gray-400">{bracketOpen}</span>}
      </div>

      {expanded && (
        <div className="pl-6 border-l border-gray-800 ml-1.5 flex flex-col">
          {keys.map((key, index) => (
            <JsonTreeViewerComponent 
              key={key} 
              name={isArray ? undefined : key} 
              data={data[key as keyof typeof data]} 
              isLast={index === keys.length - 1} 
              initiallyExpanded={false}
            />
          ))}
        </div>
      )}

      {expanded && (
        <div className="flex pl-1">
          <span className="text-gray-400">{bracketClose}</span>
          {!isLast && <span className="text-gray-400">,</span>}
        </div>
      )}
    </div>
  );
};

export const JsonTreeViewer = memo(JsonTreeViewerComponent);
