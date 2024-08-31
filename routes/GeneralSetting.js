const express = require('express');
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger")
const upload = require("../utils/upload");
const authenticateJWT = require('../utils/JWTauth');
const getDbconnection = require('../DbConnection/CdConnection');
const { DataTypes } = require('sequelize');


const uploadFields = [
  { name: 'SelectLogo', maxCount: 1 }, // Max 1 file for SelectLogo
  { name: 'FaviconImage', maxCount: 1 }, // Max 1 file for FaviconImage
  // Add more fields as needed
];


// POST new general setting
//***************************************Create ************************************************* */



/**
  * @swagger
  * /GeneralSetting/create:
  *   post:
  *     summary: Create a new general setting.
  *     tags:
  *       - General Setting
  *     requestBody:
  *       required: true
  *       content:
  *          multipart/form-data:
  *           schema:
  *             type: object
  *             properties:
  *               ProjectName:
  *                 type: string
  *                 description: Name of the project.
  *                 example: "Prajwal Engineers"
  *               Email:
  *                 type: string
  *                 description: Contact email for the project.
  *                 example: "contact@example.com"
  *               Phone:
  *                 type: string
  *                 description: Contact phone number for the project.
  *                 example: "+1234567890"
  *               Address1:
  *                 type: string
  *                 description: Address line 1 for the project.
  *                 example: "123 Main St"
  *               Address2:
  *                 type: string
  *                 description: Address line 2 for the project.
  *                 example: "Apt 101"
  *               Address3:
  *                 type: string
  *                 description: Address line 3 for the project.
  *                 example: "Building B"
  *               Address4:
  *                 type: string
  *                 description: Address line 4 for the project.
  *                 example: "Area XYZ"
  *               GoogleMapLink:
  *                 type: string
  *                 description: Link to Google Maps location.
  *                 example: "https://maps.google.com"
  *               FacebookLink:
  *                 type: string
  *                 description: Link to Facebook page.
  *                 example: "https://facebook.com/example"
  *               TwitterLink:
  *                 type: string
  *                 description: Link to Twitter profile.
  *                 example: "https://twitter.com/example"
  *               InstagramLink:
  *                 type: string
  *                 description: Link to Instagram profile.
  *                 example: "https://instagram.com/example"
  *               LinkedinLink:
  *                 type: string
  *                 description: Link to LinkedIn profile.
  *                 example: "https://linkedin.com/company/example"
  *               GooglePlusLink:
  *                 type: string
  *                 description: Link to Google Plus profile.
  *                 example: "https://plus.google.com/example"
  *               YoutubeLink:
  *                 type: string
  *                 description: Link to YouTube channel.
  *                 example: "https://youtube.com/channel/example"
  *               CopyrightInfo:
  *                 type: string
  *                 description: Copyright information.
  *                 example: "(c) 2024 Prajwal Engineers"
  *               PrivacyPolicyInfo:
  *                 type: string
  *                 description: Privacy policy information.
  *                 example: "Your privacy is important to us."
  *               MetaDescription:
  *                 type: string
  *                 description: Meta description for SEO.
  *                 example: "We provide engineering solutions with excellence."
  *               MetaKeyWords:
  *                 type: string
  *                 description: Meta keywords for SEO.
  *                 example: "engineering, solutions, excellence"
  *               MetaAuthor:
  *                 type: string
  *                 description: Author meta information.
  *                 example: "Prajwal Engineers Team"
  *               FaviconImage:
  *                 type: string
  *                 format: binary
  *                 description: URL or path to selected Favicon image.
  *                 example: "http://example.com/logo.png"
  *               SendEmailTo:
  *                 type: string
  *                 description: Email address to send emails to.
  *                 example: "admin@prajwalengineers.com"
  *               SendSms:
  *                 type: boolean
  *                 description: Whether to send SMS notifications.
  *                 example: true
  *               ProjectFontFamilyLinkURL:
  *                 type: string
  *                 description: URL for project font family.
  *                 example: "http://example.com/font.css"
  *               ProjectBackgroundColor:
  *                 type: string
  *                 description: Background color of the project.
  *                 example: "#ffffff"
  *               SelectLogo:
  *                 type: string
  *                 format: binary
  *                 description: URL or path to selected logo image.
  *                 example: "http://example.com/logo.png"
  *               MenuBackgroundColor:
  *                 type: string
  *                 description: Background color of the menu.
  *                 example: "#333333"
  *               MenuTextColor:
  *                 type: string
  *                 description: Text color of the menu.
  *                 example: "#ffffff"
  *               MenuFontFamily:
  *                 type: string
  *                 description: Font family for menu text.
  *                 example: "Arial, sans-serif"
  *               MenuFontSize:
  *                 type: string
  *                 description: Font size for menu text.
  *                 example: "16px"
  *               MenuFontWeight:
  *                 type: string
  *                 description: Font weight for menu text.
  *                 example: "normal"
  *     responses:
  *       201:
  *         description: Submitted successfully
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 message:
  *                   type: string
  *                   example: "General setting created successfully"
  *                 GeneralSetting:
  *                   type: object
  *                   properties:
  *                     // Add properties for GeneralSetting object
  *       500:
  *         description: Server error
  */





router.post('/create', authenticateJWT, upload.fields(uploadFields), async (req, res) => {
  const {
    ProjectName, Email, Phone, Address1, Address2, Address3, Address4, GoogleMapLink, FacebookLink,
    TwitterLink, InstagramLink, LinkedinLink, GooglePlusLink, YoutubeLink, CopyrightInfo,
    PrivacyPolicyInfo, MetaDescription, MetaKeyWords, MetaAuthor, SendEmailTo,
    SendSms, ProjectFontFamilyLinkURL, ProjectBackgroundColor, MenuBackgroundColor,
    MenuTextColor, MenuFontFamily, MenuFontSize, MenuFontWeight
  } = req.body;

  // image = req.files['SelectLogo']


  try {
    // FIND COMPANY USING COMPANYCODE
    const companyCode = req.companyCode;
    const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

    if (!Company) {
      return res.status(404).send({ message: "Company not found" })
    }

    // MAKE CONNECTION USING DBNAME
    const DbName = Company.dbName
    const sequelizeInstance = await getDbconnection(DbName)

    // REQUIRE MODEL AND CREATE INSTANCE
    const GenralSetting = require('../models/GeneralSetting')(
      sequelizeInstance, DataTypes
    )

    // Example: handle SelectLogo upload if present
    let existingRecord = await GenralSetting.findOne({
      where: {
        Id: 1
      },
    });

    if (existingRecord) {
      const fieldsToUpdate = {
        ProjectName, Email, Phone, Address1, Address2, Address3, Address4, GoogleMapLink, FacebookLink,
        TwitterLink, InstagramLink, LinkedinLink, GooglePlusLink, YoutubeLink, CopyrightInfo,
        PrivacyPolicyInfo, MetaDescription, MetaKeyWords, MetaAuthor, SendEmailTo,
        SendSms, ProjectFontFamilyLinkURL, ProjectBackgroundColor, MenuBackgroundColor,
        MenuTextColor, MenuFontFamily, MenuFontSize, MenuFontWeight,
      };
      const updateImageField = async (fieldName, req, existingRecord) => {
        let imageUrl = null;
        if (req.files[fieldName]) {
          const file = req.files[fieldName][0];
          imageUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
          existingRecord[fieldName] = imageUrl;
        }
      };

      // Update SelectLogo field if present
      await updateImageField('SelectLogo', req, existingRecord);

      // Update FaviconImage field if present
      await updateImageField('FaviconImage', req, existingRecord);

      for (let key in fieldsToUpdate) {
        if (fieldsToUpdate[key] !== undefined) {
          existingRecord[key] = fieldsToUpdate[key];
        }
      }
      await existingRecord.save();
    } else {
      let selectLogoUrl = null;
      if (req.files['SelectLogo']) {
        const selectLogoFile = req.files['SelectLogo'][0];
        selectLogoUrl = `${req.protocol}://${req.get("host")}/uploads/${selectLogoFile.filename}`;
      }

      // Example: handle FaviconImage upload if present
      let faviconImageUrl = null;
      if (req.files['FaviconImage']) {
        const faviconImageFile = req.files['FaviconImage'][0];
        faviconImageUrl = `${req.protocol}://${req.get("host")}/uploads/${faviconImageFile.filename}`;
      }
      // Create a new GeneralSetting object
      const newGeneralSetting = await GenralSetting.create({
        ProjectName: ProjectName,
        Email: Email,
        Phone: Phone,
        Address1: Address1,
        Address2: Address2,
        Address3: Address3,
        Address4: Address4,
        GoogleMapLink: GoogleMapLink,
        FacebookLink: FacebookLink,
        TwitterLink: TwitterLink,
        InstagramLink: InstagramLink,
        LinkedinLink: LinkedinLink,
        GooglePlusLink: GooglePlusLink,
        YoutubeLink: YoutubeLink,
        CopyrightInfo: CopyrightInfo,
        PrivacyPolicyInfo: PrivacyPolicyInfo,
        MetaDescription: MetaDescription,
        MetaKeyWords: MetaKeyWords,
        MetaAuthor: MetaAuthor,
        SendEmailTo: SendEmailTo,
        SendSms: SendSms,
        ProjectFontFamilyLinkURL: ProjectFontFamilyLinkURL,
        ProjectBackgroundColor: ProjectBackgroundColor,
        SelectLogo: selectLogoUrl,
        FaviconImage: faviconImageUrl,
        MenuBackgroundColor: MenuBackgroundColor,
        MenuTextColor: MenuTextColor,
        MenuFontFamily: MenuFontFamily,
        MenuFontSize: MenuFontSize,
        MenuFontWeight: MenuFontWeight,
      });

      logger.info(`Genral setting created successfully`)
      res.status(201).json({
        message: "GeneralSetting created successfully",
        GeneralSetting: newGeneralSetting
      });
    }

  } catch (err) {
    console.error(err);
    logger.error(`Genral setting creation failed ERROR:${err}`);
    res.status(500).json({ message: 'Server error' });
  }
});








/**
 * @swagger
 * /GeneralSetting/{id}:
 *   get:
 *     summary: Retrieve a specific general setting
 *     description: This endpoint retrieves a specific general setting by its ID.
 *     tags:
 *       - General Setting
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the general setting to retrieve
 *     responses:
 *       200:
 *         description: General setting retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 ProjectName:
 *                   type: string
 *                   example: "My Project"
 *                 Email:
 *                   type: string
 *                   example: "example@example.com"
 *                 Phone:
 *                   type: string
 *                   example: "123-456-7890"
 *                 Address1:
 *                   type: string
 *                   example: "123 Main St"
 *                 Address2:
 *                   type: string
 *                   example: "Suite 100"
 *                 Address3:
 *                   type: string
 *                   example: ""
 *                 Address4:
 *                   type: string
 *                   example: ""
 *                 GoogleMapLink:
 *                   type: string
 *                   example: "https://maps.google.com/"
 *                 FacebookLink:
 *                   type: string
 *                   example: "https://facebook.com/"
 *                 TwitterLink:
 *                   type: string
 *                   example: "https://twitter.com/"
 *                 InstagramLink:
 *                   type: string
 *                   example: "https://instagram.com/"
 *                 LinkedinLink:
 *                   type: string
 *                   example: "https://linkedin.com/"
 *                 GooglePlusLink:
 *                   type: string
 *                   example: "https://plus.google.com/"
 *                 YoutubeLink:
 *                   type: string
 *                   example: "https://youtube.com/"
 *                 CopyrightInfo:
 *                   type: string
 *                   example: "© 2024 My Company"
 *                 PrivacyPolicyInfo:
 *                   type: string
 *                   example: "Privacy policy details"
 *                 MetaDescription:
 *                   type: string
 *                   example: "Meta description"
 *                 MetaKeyWords:
 *                   type: string
 *                   example: "keywords"
 *                 MetaAuthor:
 *                   type: string
 *                   example: "Author"
 *                 SendEmailTo:
 *                   type: string
 *                   example: "notify@example.com"
 *                 SendSms:
 *                   type: string
 *                   example: "123-456-7890"
 *                 ProjectFontFamilyLinkURL:
 *                   type: string
 *                   example: "https://fonts.google.com/"
 *                 ProjectBackgroundColor:
 *                   type: string
 *                   example: "#FFFFFF"
 *                 SelectLogo:
 *                   type: string
 *                   example: "http://localhost:3000/uploads/logo.png"
 *                 MenuBackgroundColor:
 *                   type: string
 *                   example: "#000000"
 *                 MenuTextColor:
 *                   type: string
 *                   example: "#FFFFFF"
 *                 MenuFontFamily:
 *                   type: string
 *                   example: "Arial"
 *                 MenuFontSize:
 *                   type: string
 *                   example: "14px"
 *                 MenuFontWeight:
 *                   type: string
 *                   example: "bold"
 *       404:
 *         description: General setting not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "GeneralSetting not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */


router.get('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    // FIND COMPANY USING COMPANYCODE
    const companyCode = req.companyCode;
    const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

    if (!Company) {
      return res.status(404).send({ message: "Company not found" })
    }

    // MAKE CONNECTION USING DBNAME
    const DbName = Company.dbName
    const sequelizeInstance = await getDbconnection(DbName)

    // REQUIRE MODEL AND CREATE INSTANCE
    const GenralSetting = require('../models/GeneralSetting')(
      sequelizeInstance, DataTypes
    )
    const GeneralSetting = await GenralSetting.findByPk(id);
    if (GeneralSetting) {
      logger.info('GenralSetting Get successfully')
      res.status(200).json(GeneralSetting); // Return the found record
    } else {
      res.status(404).json({ error: "GeneralSetting not found" }); // Return a 404 error if not found
    }
  } catch (err) {
    console.error(err);
    logger.error(`Genral setting Get failed ERROR:${err}`);
    res.status(500).json({ message: 'Server error' });
  }
});



/**
 * @swagger
 * /GeneralSetting/get/all:
 *   get:
 *     summary: Retrieve all general settings
 *     description: This endpoint retrieves all records from the GeneralSetting table.
 *     tags:
 *       - General Setting
 *     responses:
 *       200:
 *         description: A list of general settings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Setting Name"
 *                   value:
 *                     type: string
 *                     example: "Setting Value"
 *       404:
 *         description: No general settings found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "GeneralSetting not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

// GET all general settings

router.get('/get/all', authenticateJWT, async (req, res) => {
  try {
    // FIND COMPANY USING COMPANYCODE
    const companyCode = req.companyCode;
    const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

    if (!Company) {
      return res.status(404).send({ message: "Company not found" })
    }

    // MAKE CONNECTION USING DBNAME
    const DbName = Company.dbName
    const sequelizeInstance = await getDbconnection(DbName)

    // REQUIRE MODEL AND CREATE INSTANCE
    const GenralSetting = require('../models/GeneralSetting')(
      sequelizeInstance, DataTypes
    )
    const ExGeneralSetting = await GenralSetting.findAll();
    if (ExGeneralSetting) {
      logger.info(`Successfully get all genral setting`)
      res.status(200).json(ExGeneralSetting); // Return the found record
    } else {
      res.status(404).json({ error: "GeneralSetting not found" }); // Return a 404 error if not found
    }
  } catch (err) {
    console.error(err);
    logger.error(`Get all genral setting failed ERROR:${err}`);
    res.status(500).json({ message: 'Server error' });
  }
});


// PUT update general setting by ID

//**************************Update******************************** */

/**
* @swagger
* /GeneralSetting/update/{id}:
*   put:
*     summary: Update a specific GeneralSetting by ID.
*     tags:
*       - General Setting
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*         description: Numeric ID of the GeneralSetting to update.
*     requestBody:
*       required: true
*       content:
*          multipart/form-data:
*           schema:
*             type: object
*             properties:
*               ProjectName:
*                 type: string
*                 description: Name of the project.
*                 example: "Prajwal Engineers"
*               Email:
*                 type: string
*                 description: Contact email for the project.
*                 example: "contact@example.com"
*               Phone:
*                 type: string
*                 description: Contact phone number for the project.
*                 example: "+1234567890"
*               Address1:
*                 type: string
*                 description: Address line 1 for the project.
*                 example: "123 Main St"
*               Address2:
*                 type: string
*                 description: Address line 2 for the project.
*                 example: "Apt 101"
*               Address3:
*                 type: string
*                 description: Address line 3 for the project.
*                 example: "Building B"
*               Address4:
*                 type: string
*                 description: Address line 4 for the project.
*                 example: "Area XYZ"
*               GoogleMapLink:
*                 type: string
*                 description: Link to Google Maps location.
*                 example: "https://maps.google.com"
*               FacebookLink:
*                 type: string
*                 description: Link to Facebook page.
*                 example: "https://facebook.com/example"
*               TwitterLink:
*                 type: string
*                 description: Link to Twitter profile.
*                 example: "https://twitter.com/example"
*               InstagramLink:
*                 type: string
*                 description: Link to Instagram profile.
*                 example: "https://instagram.com/example"
*               LinkedinLink:
*                 type: string
*                 description: Link to LinkedIn profile.
*                 example: "https://linkedin.com/company/example"
*               GooglePlusLink:
*                 type: string
*                 description: Link to Google Plus profile.
*                 example: "https://plus.google.com/example"
*               YoutubeLink:
*                 type: string
*                 description: Link to YouTube channel.
*                 example: "https://youtube.com/channel/example"
*               CopyrightInfo:
*                 type: string
*                 description: Copyright information.
*                 example: "(c) 2024 Prajwal Engineers"
*               PrivacyPolicyInfo:
*                 type: string
*                 description: Privacy policy information.
*                 example: "Your privacy is important to us."
*               MetaDescription:
*                 type: string
*                 description: Meta description for SEO.
*                 example: "We provide engineering solutions with excellence."
*               MetaKeyWords:
*                 type: string
*                 description: Meta keywords for SEO.
*                 example: "engineering, solutions, excellence"
*               MetaAuthor:
*                 type: string
*                 description: Author meta information.
*                 example: "Prajwal Engineers Team"
*               FaviconImage:
*                 type: string
*                 format: binary
*                 description: URL or path to selected Favicon image.
*                 example: "http://example.com/logo.png"
*               SendEmailTo:
*                 type: string
*                 description: Email address to send emails to.
*                 example: "admin@prajwalengineers.com"
*               SendSms:
*                 type: boolean
*                 description: Whether to send SMS notifications.
*                 example: true
*               ProjectFontFamilyLinkURL:
*                 type: string
*                 description: URL for project font family.
*                 example: "http://example.com/font.css"
*               ProjectBackgroundColor:
*                 type: string
*                 description: Background color of the project.
*                 example: "#ffffff"
*               SelectLogo:
*                 type: string
*                 format: binary
*                 description: URL or path to selected logo image.
*                 example: "http://example.com/logo.png"
*               MenuBackgroundColor:
*                 type: string
*                 description: Background color of the menu.
*                 example: "#333333"
*               MenuTextColor:
*                 type: string
*                 description: Text color of the menu.
*                 example: "#ffffff"
*               MenuFontFamily:
*                 type: string
*                 description: Font family for menu text.
*                 example: "Arial, sans-serif"
*               MenuFontSize:
*                 type: string
*                 description: Font size for menu text.
*                 example: "16px"
*               MenuFontWeight:
*                 type: string
*                 description: Font weight for menu text.
*                 example: "normal"
*     responses:
*       201:
*         description: Submitted successfully
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: "General setting created successfully"
*                 GeneralSetting:
*                   type: object
*                   properties:
*                     // Add properties for GeneralSetting object
*       500:
*         description: Server error
*/

router.put('/update/:id', authenticateJWT, upload.fields([{ name: 'SelectLogo', maxCount: 1 }, { name: 'FaviconImage', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;
  const {
    ProjectName, Email, Phone, Address1, Address2, Address3, Address4, GoogleMapLink, FacebookLink,
    TwitterLink, InstagramLink, LinkedinLink, GooglePlusLink, YoutubeLink, CopyrightInfo,
    PrivacyPolicyInfo, MetaDescription, MetaKeyWords, MetaAuthor, SendEmailTo,
    SendSms, ProjectFontFamilyLinkURL, ProjectBackgroundColor, MenuBackgroundColor,
    MenuTextColor, MenuFontFamily, MenuFontSize, MenuFontWeight
  } = req.body;

  try {
    // FIND COMPANY USING COMPANYCODE
    const companyCode = req.companyCode;
    const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

    if (!Company) {
      return res.status(404).send({ message: "Company not found" })
    }

    // MAKE CONNECTION USING DBNAME
    const DbName = Company.dbName
    const sequelizeInstance = await getDbconnection(DbName)

    // REQUIRE MODEL AND CREATE INSTANCE
    const GenralSetting = require('../models/GeneralSetting')(
      sequelizeInstance, DataTypes
    )

    let existingGeneralSetting = await GenralSetting.findByPk(id);

    if (!existingGeneralSetting) {
      return res.status(404).json({ message: 'GeneralSetting not found' });
    }

    // Handle SelectLogo upload if exists
    if (req.files['SelectLogo']) {
      const selectLogoFile = req.files['SelectLogo'][0];
      const selectLogoUrl = `${req.protocol}://${req.get("host")}/uploads/${selectLogoFile.filename}`;

      // Delete existing SelectLogo file if exists
      if (existingGeneralSetting.SelectLogo) {
        const existingImagePath = existingGeneralSetting.SelectLogo.replace(
          `${req.protocol}://${req.get("host")}/uploads`,
          "./uploads"
        );
        fs.unlinkSync(existingImagePath);
      }

      existingGeneralSetting.SelectLogo = selectLogoUrl;
    }

    // Handle FaviconImage upload if exists
    if (req.files['FaviconImage']) {
      const faviconImageFile = req.files['FaviconImage'][0];
      const faviconImageUrl = `${req.protocol}://${req.get("host")}/uploads/${faviconImageFile.filename}`;

      // Delete existing FaviconImage file if exists
      if (existingGeneralSetting.FaviconImage) {
        const existingImagePath = existingGeneralSetting.FaviconImage.replace(
          `${req.protocol}://${req.get("host")}/uploads`,
          "./uploads"
        );
        fs.unlinkSync(existingImagePath);
      }

      existingGeneralSetting.FaviconImage = faviconImageUrl;
    }

    // Update other GeneralSetting properties
    existingGeneralSetting.ProjectName = ProjectName;
    existingGeneralSetting.Email = Email;
    existingGeneralSetting.Phone = Phone;
    existingGeneralSetting.Address1 = Address1;
    existingGeneralSetting.Address2 = Address2;
    existingGeneralSetting.Address3 = Address3;
    existingGeneralSetting.Address4 = Address4;
    existingGeneralSetting.GoogleMapLink = GoogleMapLink;
    existingGeneralSetting.FacebookLink = FacebookLink;
    existingGeneralSetting.TwitterLink = TwitterLink;
    existingGeneralSetting.InstagramLink = InstagramLink;
    existingGeneralSetting.LinkedinLink = LinkedinLink;
    existingGeneralSetting.GooglePlusLink = GooglePlusLink;
    existingGeneralSetting.YoutubeLink = YoutubeLink;
    existingGeneralSetting.CopyrightInfo = CopyrightInfo;
    existingGeneralSetting.PrivacyPolicyInfo = PrivacyPolicyInfo;
    existingGeneralSetting.MetaDescription = MetaDescription;
    existingGeneralSetting.MetaKeyWords = MetaKeyWords;
    existingGeneralSetting.MetaAuthor = MetaAuthor;
    existingGeneralSetting.SendEmailTo = SendEmailTo;
    existingGeneralSetting.SendSms = SendSms;
    existingGeneralSetting.ProjectFontFamilyLinkURL = ProjectFontFamilyLinkURL;
    existingGeneralSetting.ProjectBackgroundColor = ProjectBackgroundColor;
    existingGeneralSetting.MenuBackgroundColor = MenuBackgroundColor;
    existingGeneralSetting.MenuTextColor = MenuTextColor;
    existingGeneralSetting.MenuFontFamily = MenuFontFamily;
    existingGeneralSetting.MenuFontSize = MenuFontSize;
    existingGeneralSetting.MenuFontWeight = MenuFontWeight;

    // Save the updated GeneralSetting
    await existingGeneralSetting.save();
    
    logger.info(`Genral Setting update ${existingGeneralSetting}`)
    res.status(200).json(existingGeneralSetting);
  } catch (err) {
    console.error(err);
    logger.error(`Error in Genral Setting update: ${err}`)
    res.status(500).json({ message: 'Server error' });
  }
});



// Other routes (POST, PUT, DELETE) can also be annotated similarly

module.exports = router;
