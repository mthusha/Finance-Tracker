const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected...');
}).catch((err) => {
  console.error(err.message);
  process.exit(1);
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = new User({ email, password, name, phone });
    await user.save();

    const payload = { user: { id: user.id, email: user.email, name: user.name } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// user CRUD
// Fetch user data using email
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update user data
app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password: hashedPassword, phone },
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// Remove user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id, email: user.email, name: user.name } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/auth/validate-token', (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ email: decoded.user.email, name: decoded.user.name });
  } catch (err) {
    res.status(400).json({ message: 'Token is not valid' });
  }
});
const transactionSchema = new mongoose.Schema({}, { strict: false });

const Transaction = mongoose.model('Transaction', transactionSchema);


// save transection
app.post('/api/transaction', async (req, res) => {
  try {
    const { activeTab, ...data } = req.body;
    const transactionData = { type: activeTab, ...data };
    const transaction = new Transaction(transactionData);
    await transaction.save();
    res.status(201).send(transaction);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


// save transection
// app.post('/api/transaction', async (req, res) => {
//     try {
//         const { activeTab, ...data } = req.body;
//         const transactionData = { type: activeTab, ...data };
//         const transaction = new Transaction(transactionData);
//         await transaction.save();
//         res.status(201).send(transaction);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

// Endpoint to get the last 5 transactions of a selected type
app.get("/api/transaction/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { userName } = req.query;
    const transactions = await Transaction.find({ type, user: userName })
      .sort({ timestamp: -1 })
      .limit(5);
    res.status(200).send(transactions);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});
//transactions of a loggedd user
app.get("/api/Alltransaction/:email", async (req, res) => {
  try {
    const { email } = req.params; 
    const transactions = await Transaction.find({ user: email });
    res.status(200).send(transactions);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});


//delete transaction
  app.delete('/api/transaction/:id', async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(400).send(error);
    }
});

// add acc
const accountSchema = new mongoose.Schema({
  name: String,
  group: String,
  balance: Number,
  currency: String,
  userName:String,
});

const Account = mongoose.model('Account', accountSchema);

// Routes
app.post("/api/accounts", async (req, res) => {
  const { name, group, balance, currency, userName } = req.body;

  try {
    const newAccount = new Account({
      name,
      group,
     balance: parseInt(balance),
      currency,
      userName,
    });

    await newAccount.save();
    res.status(201).json(newAccount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update an existing account by ID
app.put("/api/accounts/:id", async (req, res) => {
  const { id } = req.params;
  const { name, group, balance, currency, userName } = req.body;

  try {
    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { name, group, balance, currency, userName },
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).send({ error: "Account not found" });
    }

    res.send(updatedAccount);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Delete an account by ID
app.delete("/api/accounts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAccount = await Account.findByIdAndDelete(id);

    if (!deletedAccount) {
      return res.status(404).send({ error: "Account not found" });
    }

    res.send({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
// fetch acc
app.get("/api/accounts/:userName", async (req, res) => {
  try {
    const { userName } = req.params;
    const accounts = await Account.find({ userName });
    res.json(accounts);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// Update account balance
app.put("/api/accounts/:id/update-balance", async (req, res) => {
  const accountId = req.params.id;
  const { newBalance } = req.body;

  try {
    const account = await Account.findByIdAndUpdate(
      accountId,
      { balance: parseFloat(newBalance) },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
