import CattleGrazing from '../assets/images/CattleLogin3.jpg';

const Login = () => {
  return (
    <div className="flex w-full h-screen">
      {/* login form */}
      <div className="flex items-center justify-center bg-lime-100 w-full lg:w-1/2">
        {/* <div className="flex flex-col bg-white h-4/5 w-4/5"> */}
        <div className="bg-white px-10 py-20 rounded-3xl border-2 border-gray-100">
          <h1 className="text-5xl font-semibold">Sign in to CMS now</h1>
          <p className="font-medium text-lg text-gray-500 mt-4">
            Welcome back! Please enter youe details
          </p>
          <div className="mt-8">
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
            <button className="mt-6 ml-2 font-medium text-base text-violet-400">
              Forgot Pasword
            </button>
            <div className="mt-8 flex flex-col">
              <button className="active:scale-[.98] active:duration-75 hover:scale-[1.01] ease-in-out transition-all py-3 rounded-xl bg-violet-500 text-white text-lg font-bold">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Display the image */}
      <div className="hidden lg:flex w-1/2 items-center justify-start">
        <img src={CattleGrazing} className="w-full h-full object-cover" />
      </div>
    </div>
    // <div className="flex w-full h-screen items-start">
    //   <div className="relative w-1/2 h-full flex flex-col p-20">
    //     <h1>Brand</h1>
    //     <div className="w-full flex flex-col">
    //       <h2 className="text-4xl font-semibold mb-4">Login</h2>
    //       <p className="mb-2">Welcome back! Please enter your details.</p>
    //     </div>
    //   </div>

    //   <div className="relative w-1/2 h-full flex flex-col">
    //     <img src={CattleGrazing} className="w-full h-full object-cover" />
    //   </div>
    // </div>
  );
};

export default Login;
