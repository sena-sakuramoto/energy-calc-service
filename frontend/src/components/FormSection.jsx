// frontend/src/components/FormSection.jsx
import React from 'react';

export default function FormSection({
  title,
  icon: Icon,
  children,
  className = "",
  collapsible = false,
  defaultExpanded = true
}) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          {Icon && <Icon className="mr-3 text-accent-600" />}
          {title}
        </h2>

        {collapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-primary-600 hover:text-accent-600 rounded-lg transition-colors"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
      </div>

      {(!collapsible || isExpanded) && (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </div>
  );
}
