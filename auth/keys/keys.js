const fs = require('fs');
const path = require('path')

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'ecdsa-p521-private.pem'), 'utf8')
const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, 'ecdsa-p521-public.pem'), 'utf8')

module.exports = { PRIVATE_KEY, PUBLIC_KEY }