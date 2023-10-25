const Encrypt = require('cryptr');
const CryptoJS = require('crypto-js');
const crypt = new Encrypt(require('../config/config').cryptHash);
const secretKey = 'secret key 123';
module.exports = {
    encrypt: text => {
        return crypt.encrypt(text);
    },
    decrypt: text => {
        return crypt.decrypt(text);
    },
    encryptLink: text => {
        const salt = CryptoJS.lib.WordArray.random(128 / 8);
        const iv = CryptoJS.lib.WordArray.random(128 / 8);
        const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.PBKDF2(secretKey, salt, { keySize: 256 / 32, iterations: 100 }) /* key */, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
        const cipherText = salt.toString() + iv.toString() + encrypted.toString();
        return cipherText.toString().replace(/[/]/g, 'Por21Ld');
        // const cipherText = cryptoJs.AES.encrypt(text, 'secret key 123');
        // return cipherText.toString().replace(/[/]/g, 'Por21Ld');
    },
    decryptLink: text => {
        const id = text.replace(/Por21Ld/g, '/');
        const bytes = cryptoJs.AES.decrypt(id, 'secret key 123');
        return  bytes.toString(cryptoJs.enc.Utf8);
    }
};
