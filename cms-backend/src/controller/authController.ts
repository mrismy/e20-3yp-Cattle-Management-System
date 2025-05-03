module.exports.login = (req: any, res: any) => {
  const { email, password } = req.body;
  console.log(email, password);
  res.send('Login page');
};

module.exports.signup = (req: any, res: any) => {
  const { email, password } = req.body;
  console.log(email, password);
  res.send('Signup page');
};
