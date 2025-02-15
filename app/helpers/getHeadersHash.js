const crypto = require('crypto');
const { CRYPTO_KEY } = require('../data/VARIABLE')

const getHeadersHash = (headers, options = {
	alg: `sha256`,
	targetHeaders: [`user-agent`,	`accept-language`]
}) => {
	const { alg, targetHeaders } = options;
	let string = '';
	
	targetHeaders.forEach(item => {
		string += headers[item];
	})

	const hash = crypto.createHash(alg, CRYPTO_KEY)
    .update(string)
    .digest('hex');

	return hash;
}

module.exports = getHeadersHash;