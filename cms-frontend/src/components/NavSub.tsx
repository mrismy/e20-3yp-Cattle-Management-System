import { useState } from 'react';

interface NavSubProps {
  options: String[];
}

const NavSub = ({ options }: NavSubProps) => {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  return (
    <nav>
      <ul className="flex items-center justify-start">
        {options.map((option, index) => (
          <li
            key={index}
            className={`p-2 text-sm font-medium text-gray-600 hover:text-green-700 hover:border-b-green-700 border-2 border-transparent cursor-pointer
              ${
                selectedOption === option
                  ? 'text-green-700 border-b-green-700'
                  : 'text-gray-600'
              }`}
            onClick={() => setSelectedOption(option)}>
            {option.toUpperCase()}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavSub;
