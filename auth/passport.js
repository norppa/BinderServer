
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const { PUBLIC_KEY } = require('./keys/keys')

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUBLIC_KEY,
    algorithms: ['PS512']
}

module.exports = {
    initialize: () => {
        passport.use(new JwtStrategy(options, async (payload, done) => {
            done(null, { site: payload.site })
        }))
        return passport.initialize()
    },
    authenticate: passport.authenticate('jwt', { session: false })
}