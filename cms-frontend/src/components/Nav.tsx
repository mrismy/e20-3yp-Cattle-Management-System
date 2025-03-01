import { IconType } from 'react-icons';
import logo from '../assets/images/logo.png';
import { menuLinks } from '../constants';
import { accountLinks } from '../constants';

interface NavLink {
  label: string;
  href: string;
  symbol: IconType;
}

const Nav = () => {
  return (
    // <div className="flex flex-col w-1/6 shadow-2xl z-10 p-5">
    <div className="flex flex-col w-1/6 shadow-2xl z-10">
      <div>
        {/* logo */}
        <div className="flex justify-center items-center">
          <img src={logo} className="w-40 h-40" />
        </div>

        {/* Menu */}
        <nav className="mt-6">
          <h1 className="text-xl font-medium font-sans font-stretch-110% ml-5">
            Menu
          </h1>
          <ul className="mt-2 mb-8">
            {menuLinks.map((item: NavLink) => (
              <li
                key={item.label}
                className="flex items-center space-x-3 hover:bg-green-700 p-2 rounded-r-full group">
                <item.symbol className="text-black group-hover:text-white w-5 h-5 ml-6" />
                <a
                  href={item.href}
                  className="text-gray-700 text-lg group-hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <hr className="text-gray-400" />

        {/* Account */}
        <nav className="mt-8">
          <h1 className="text-xl font-medium font-sans font-stretch-110% ml-5">
            Account
          </h1>
          <ul className="mt-2 mb-4">
            {accountLinks.map((item: NavLink) => (
              <li
                key={item.label}
                className="flex items-center space-x-3 hover:bg-amber-700 p-2 rounded-r-full group">
                <item.symbol className="text-black group-hover:text-white w-5 h-5 ml-6" />
                <a
                  href={item.href}
                  className="text-gray-700 text-lg group-hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Nav;
