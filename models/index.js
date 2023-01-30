const dbConfig = require("../configuration/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.note = require("./note.model.js")(sequelize, Sequelize);

// ---------- table relation ------------
db.user.hasMany(db.note)
db.note.belongsTo(db.user, { as: 'Sender' });
db.note.belongsTo(db.user, { as: 'Receiver' });
// --------------------------------------

module.exports = db;