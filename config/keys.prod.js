console.log(process.env);

module.exports = {
    mongoURI: process.env.MONGO_URI,
    jwt: process.env.JWT
};
