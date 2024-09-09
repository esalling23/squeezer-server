const express = require('express')
const crypto = require('crypto')
const passport = require('passport')
const bcrypt = require('bcrypt')

const bcryptSaltRounds = 10

const errors = require('../lib/customErrors')

const BadParamsError = errors.BadParamsError
const BadCredentialsError = errors.BadCredentialsError

const User = require('../lib/prismaClient').user

const signUp = (req, res, next) => {
  Promise.resolve(req.body)
    .then(data => {
      if (!data ||
          !data.password ||
          data.password !== data.password_confirmation) {
        throw new BadParamsError()
      }
			return data.password
    })
    .then((pw) => bcrypt.hash(pw, bcryptSaltRounds))
    .then(hash => User.create({ 
			data: {
				email: req.body.email,
				password: hash
			}
		}))
    .then(user => res.status(201).json({ user }))
    .catch(next)
}

const signIn = (req, res, next) => {
  const pw = req.body.password
  let user

	// console.log(req.user);

  User.findUnique({ where: { email: req.body.email } })
    .then(record => {
      if (!record) {
        throw new BadCredentialsError()
      }
      user = record
      return bcrypt.compare(pw, user.password)
    })
    .then(correctPassword => {
      if (correctPassword) {
        const token = crypto.randomBytes(16).toString('hex')
				return User.update({
					where: { id: user.id },
					data: {
						token,
					}
				});
      } else {
        throw new BadCredentialsError()
      }
    })
		.then(user => {
      res.status(201).json({ user })
    })
    .catch(next)
}

const changePassword = (req, res, next) => {
  let user
  User.findById(req.user.id)
    .then(record => { user = record })
    .then(() => bcrypt.compare(req.body.passwords.old, user.hashedPassword))
    .then(correctPassword => {
      if (!req.body.passwords.new || !correctPassword) {
        throw new BadParamsError()
      }
    })
    .then(() => bcrypt.hash(req.body.passwords.new, bcryptSaltRounds))
    .then(hash => {
      user.hashedPassword = hash
      return user.save()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
}

const signOut = async (req, res, next) => {
	try {
		const user = await User.update({
			where: { id: req.user.id },
			data: {
				token: null
			}
		})
		res.json({ success: true })
	} catch (err) {
		next(err);
	}
}

module.exports = {
	signIn,
	signUp,
	signOut,
	changePassword
}
