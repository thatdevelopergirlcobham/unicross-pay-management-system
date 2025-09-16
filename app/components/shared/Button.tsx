'use client';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, onClick, variant = 'primary', ...props }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
  };
  return (
    <button onClick={onClick} className={`${baseStyles} ${variantStyles[variant]}`} {...props}>
      {children}
    </button>
  );
}