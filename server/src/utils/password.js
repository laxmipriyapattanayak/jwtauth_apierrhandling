const bcrypt = require("bcrypt");
const saltRounds=10;

const securePassword = async (password) => {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch ( error ) {
        console.log(error);
    }
};
const comparePassword = async (plainPassword, password) => {
    try{
        return await bcrypt.compare(plainPassword, password);
    } catch(error) {
        console.log(error);
    }
};

 module.exports = { securePassword, comparePassword };