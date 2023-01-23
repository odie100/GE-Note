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
            type: DataTypes.STRING,
            allowNull: false,
        },
        parcours: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        level: { // L1, ..., M2,...
            type: DataTypes.STRING,
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        session: {
            type: DataTypes.STRING,
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
            type: DataTypes.STRING,
            allowNull: false,
        },

        operation_date: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        },

        comment: {
            type: DataTypes.TEXT
        },

        // user_id: {
        //   type: DataTypes.INTEGER,
        //
        //   references: {
        //     // This is a reference to another model
        //     model: Bar,
        //
        //     // This is the column name of the referenced model
        //     key: 'id',
        //
        //     // With PostgreSQL, it is optionally possible to declare when to check the foreign key constraint, passing the Deferrable type.
        //     deferrable: Deferrable.INITIALLY_IMMEDIATE
        //   }
        // }
    });

    return Note
}