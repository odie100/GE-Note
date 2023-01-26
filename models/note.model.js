const { DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const Note = sequelize.define("note", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        mention: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        parcours: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        level: { // L1, ..., M2,...
            type: DataTypes.STRING(5),
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        session: {
            type: DataTypes.ENUM({
                values: ['Normale', 'Rattrappage']
            }),
            allowNull: false,
        },
        numbers: {  // numbers of papers
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        sending: { // way to send notes ex:colis ...
            type: DataTypes.STRING,
            allowNull: false,
        },
        univ_year: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        operation_date: {
            type: DataTypes.DATEONLY,
            defaultValue: new Date(),
        },
        valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        comment: {
            type: DataTypes.TEXT
        },

    });

    return Note
}