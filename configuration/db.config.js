module.exports = {
    HOST: "localhost",
    USER: "Emitech",
    PASSWORD: "Emitech$",
    DB: "genote",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};