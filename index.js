const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('config')

mongoose.Promise = global.Promise
mongoose.connect(config.get('mongo.url'))

const { Schema } = mongoose
const { ObjectId } = mongoose.Types;
ObjectId.prototype.valueOf = function () {
	return this.toString()
}

const User = mongoose.model('User', new Schema({
  username: String,
  password: String,
}))

const Transaction = mongoose.model('Transaction', new Schema({
  user: { type: ObjectId, ref: 'User' },
  amount: Number,
  type: String, // income, expense
  remark: String,
  date: Date,
  // balance: Number,
}))

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('hello'))

app.get('/users/:id', (req, res) => {
  User.findById(req.params.id)
    .then((data) => {
      res.send(data)
    })
})

app.post('/users/login', (req, res) => {
  User.findOne(req.body).lean()
    .then((data) => {
      if (data) {
        res.send({ ...data, auth: true })
      } else {
        res.status(404).send({ auth: false })
      }
    })
})

app.post('/users', (req, res) => {
  User.create(req.body)
    .then((data) => {
      res.send(data)
    })
})

app.get('/transactions', (req, res) => {
  Transaction.find({ user: req.query.user })
    .then((data) => {
      res.send(data)
    })
})

app.post('/transactions', (req, res) => {
  Transaction.create(req.body)
    .then((data) => {
      res.send(data)
    })
})

app.put('/transactions/:id', (req, res) => {
  Transaction.findOneAndUpdate({ _id: req.params.id }, req.body)
    .then((data) => {
      res.send(data)
    })
})

app.delete('/transactions/:id', (req, res) => {
  Transaction.findOneAndRemove({ _id: req.params.id })
    .then((data) => {
      res.send(data)
    })
})

app.listen(8080, () => {
  console.log('listen on port 8080')
})
