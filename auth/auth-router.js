const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); //1:  npm i jsonwebtoken

const Users = require("../users/users-model.js");


router.post('/register', (req,res) =>{
    const user = req.body;

    const hash = bcrypt.hashSync(user.password, 12)
    user.password = hash;

    Users.add(user)
        .then(userN => {
            res.status(200).json(userN)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json(error);
          });
})

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = getJwtToken(user.username);
        res.status(200).json({
          message: `Welcome ${user.username}! have a token...`,
          token
        });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json({error: "login error"});
    });
});

router.get('/logout', (req, res) => {
    if(req.session) {
      req.session.destroy(error => {
        if (error) {
          res.status(500).json({ message: "you can check out any time you like, but you can never leave..." })
        } else {
          res.status(200).json({ message: "logged out successfully" })
        } 
      })
    } else {
      res.status(200).json({ message: "bye felicia" })
    }
  })

function getJwtToken(username) {
  const payload = {
    username
  };

  const secret = process.env.JWT_SECRET || "is it secret, is it safe?";

  const options = {
    expiresIn: "1d"
  };

  return jwt.sign(payload, secret, options);
}

module.exports = router;
