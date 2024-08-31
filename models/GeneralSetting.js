const { Sequelize, DataTypes} = require("sequelize");

module.exports = (Sequelize, DataTypes)=>{
    const GeneralSetting = Sequelize.define(
        "GeneralSetting",
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            ProjectName: {
                type: DataTypes.STRING,
                allowNull: false,
              },

              Email: {
                type: DataTypes.STRING,
                allowNull: false,
              },

              Phone: {
                type: DataTypes.STRING,
                allowNull: false,
              },

              Address1: {
                type: DataTypes.STRING,
                allowNull: false,
              },

              Address2: {
                type: DataTypes.STRING,
                allowNull: true,
              },
              Address3: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              Address4: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              GoogleMapLink: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              FaceBookLink: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              TwitterLink: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              InstagramLink: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              LinkedinLink: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              GooglePlusLink: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              YoutubeLink: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              CopyrightInfo: {
                type: DataTypes.STRING,
                allowNull: false,
              },

              PrivacyPolicyInfo: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              MetaDescription: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              MetaKeywords: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              MetaAuthor: {
                type: DataTypes.STRING,
                allowNull: true,
              },

              FaviconImage: {
                type: DataTypes.STRING, 
                allowNull: true,
              },

              SendEmailTo: {
                type: DataTypes.STRING, 
                allowNull: false,
              },

              SendSms: {
                type: DataTypes.STRING, 
                allowNull: true,
              },

              ProjectFontFamilyLinkURL: {
                type: DataTypes.STRING, 
                allowNull: true,
              },

              ProjectBackgroundColor: {
                type: DataTypes.STRING, 
                allowNull: true,
              },

              SelectLogo: {
                type: DataTypes.STRING, 
                allowNull: true,
              },

              MenuBackgroundColor: {
                type: DataTypes.STRING, 
                allowNull: true,
              },

              MenuTextColor: {
                type: DataTypes.STRING, 
                allowNull: true,
              },

              MenuFontFamily: {
                type: DataTypes.STRING, 
                allowNull: true,
              },

              MenuFontWeight: {
                type: DataTypes.STRING, 
                allowNull: true,
              },

        },
        {
            modelName: "GeneralSetting",
            tableName: "GeneralSettings",
            timestamps: true,
            underscrored: true,
        }
    );
    return GeneralSetting;
};