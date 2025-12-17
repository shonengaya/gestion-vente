import React from 'react';

// Omit title from HTML attributes to avoid conflict with our custom title prop
interface BaseCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> { }

interface CardProps extends BaseCardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, ...props }) => {
  return (
    <div className={`bg-white border border-gray-100 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow duration-200 ${className}`} {...props}>
      {title && (
        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
