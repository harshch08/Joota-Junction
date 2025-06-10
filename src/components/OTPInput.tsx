import React, { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length,
  value,
  onChange,
  disabled = false,
  autoFocus = false
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Update internal state when value prop changes
    const otpArray = value.split('').slice(0, length);
    const newOtp = [...new Array(length).fill(''), ...otpArray].slice(0, length);
    setOtp(newOtp);
  }, [value, length]);

  useEffect(() => {
    // Auto-focus first input
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Update parent component
    onChange(newOtp.join(''));

    // Move to next input if value is entered
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      const newOtp = [...otp];
      
      if (newOtp[index]) {
        // If current input has value, clear it
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      } else if (index > 0) {
        // If current input is empty, go to previous input and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    
    if (pastedData.length > 0) {
      const otpArray = pastedData.split('').slice(0, length);
      const newOtp = [...new Array(length).fill(''), ...otpArray].slice(0, length);
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(otpArray.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-12 sm:w-14 sm:h-14
            text-center text-lg sm:text-xl font-bold font-mono
            border-2 rounded-xl
            focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
            transition-all duration-300 ease-in-out
            shadow-sm hover:shadow-md focus:shadow-lg
            transform hover:scale-105 focus:scale-105
            ${disabled 
              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed shadow-none hover:shadow-none focus:shadow-none transform-none' 
              : digit 
                ? 'border-green-500 bg-green-50 text-green-700 shadow-green-100' 
                : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400 hover:bg-blue-50'
            }
          `}
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
          }}
        />
      ))}
    </div>
  );
};

export default OTPInput; 