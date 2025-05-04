import CattleGrazing from '../assets/images/CattleLogin3.jpg';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full h-screen">
      {/* Signup form */}
      <div className="flex items-center justify-center bg-lime-100 w-full lg:w-1/2">
        <div className="bg-white w-xl px-10 py-12 rounded-3xl border-2 border-gray-100">
          <h1 className="text-5xl font-semibold">Sign up to CMS now</h1>
          <div className="mt-8">
            <div className="mt-3">
              <label className="text-lg font-medium">First name</label>
              <input
                className="w-full border-2 border-gray-100 bg-transparent rounded-lg p-3 mt-1"
                placeholder="Enter your first name"
              />
            </div>
            <div className="mt-3">
              <label className="text-lg font-medium">Last name</label>
              <input
                className="w-full border-2 border-gray-100 bg-transparent rounded-lg p-3 mt-1"
                placeholder="Enter your last name"
              />
            </div>
            <div>
              <label className="text-lg font-medium">Email</label>
              <input
                className="w-full border-2 border-gray-100 bg-transparent rounded-lg p-3 mt-1"
                placeholder="Enter your email"
              />
            </div>
            <div className="mt-3">
              <label className="text-lg font-medium">Password</label>
              <input
                className="w-full border-2 border-gray-100 bg-transparent rounded-lg p-3 mt-1"
                placeholder="Enter your password"
                type="password"
              />
            </div>
            <div className="mt-5 flex flex-col">
              <button className="hover:scale-[1.01] ease-in-out transition-all py-3 rounded-xl bg-violet-500 text-white text-lg font-bold">
                Sign up
              </button>
            </div>
            <div className="flex flex-row mt-3 ml-1 items-center space-x-4">
              <p className="text-md text-gray-500">Already have an account?</p>
              <button
                onClick={() => navigate('/login')}
                className="text-md text-violet-400 hover:text-violet-700 hover:scale-[1.02]">
                Log in here
              </button>
            </div>
            {/* <div className="mt-5">
              <Divider>Or</Divider>
            </div> */}
          </div>
        </div>
      </div>

      {/* Display the image */}
      <div className="hidden lg:flex w-1/2 items-center justify-start">
        <img src={CattleGrazing} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default Signup;
