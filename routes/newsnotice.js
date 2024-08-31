const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const getDbconnection = require("../DbConnection/CdConnection");
const { DataTypes } = require("sequelize");
const authenticateJWT = require("../utils/JWTauth");
const logger = require("../utils/logger");

//apis for news and Notices

/**
 * @swagger
 * /newsnotices/create:
 *   post:
 *     summary: Create News And Notices
 *     description: To create news and notices .
 *     tags:
 *       - News And Notices
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 description: Title Of the News or Notice
 *                 example: "New Event"
 *               Description:
 *                 type: string
 *                 description: Description of the News or Notice
 *                 example: "Details about the new event."
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Image to be uploaded for the News or Notice
 *               Date:
 *                 type: string
 *                 format: date
 *                 description: Enter Date in format(yyyy-mm-dd)
 *                 example: "2024-06-04"
 *               Status:
 *                 type: boolean
 *                 description: Status for the news or notice
 *               Type:
 *                 type: string
 *                 enum: [News,Notice]
 *                 description: Type News Or Notice
 *     responses:
 *        201:
 *          description: NewsNotice created successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 'News or Notice Created Successfully'
 *                  newsNotice:
 *                    type: object
 *                    properties:
 *                      Title:
 *                        type: string
 *                      Description:
 *                        type: string
 *                      Date:
 *                        type: string
 *                      ImagePath:
 *                        type: string
 *                      Status:
 *                        type: boolean
 *                      Type:
 *                        type: string
 *        500:
 *          description: Internal Server Error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Internal Server Error"
 */
router.post("/create", authenticateJWT, upload.single("Image"), async (req, res) => {
  const { Title, Description, Date, Status, Type } = req.body;
  const Image = req.file;
  let imagePath = null;

  if (Image) {
    imagePath = `http://localhost:3000/uploads/${Image.filename}`;
  }

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
    const NewsNotice = require('../models/newsandnotice.model')(
      sequelizeInstance, DataTypes
    )

    const newNewsNotice = await NewsNotice.create({
      Title: Title,
      Description: Description,
      Date: Date,
      ImagePath: imagePath,
      Status: !!Status,
      Type: Type,
    });

    logger.info(`successfully created newsnotice`)
    res.status(201).json({
      message: "NewsNotice created successfully",
      newsNotice: newNewsNotice,
    });
  } catch (error) {
    logger.error(`failed to create newsnotice`)
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /newsnotices/{Id}:
 *   get:
 *     summary: Retrieve a specific News or Notice
 *     description: Fetches details of a specific News or Notice by its ID.
 *     tags:
 *       - News And Notices
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the slider to retrieve
 *     responses:
 *       200:
 *        description: Details Of News and Notice
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 'Details Of News Or Notice'
 *                newsNotice:
 *                  type: object
 *                  properties:
 *                    Title:
 *                      type: string
 *                    Description:
 *                      type: string
 *                    Date:
 *                      type: string
 *                    ImagePath:
 *                      type: string
 *                    Status:
 *                      type: boolean
 *                    Type:
 *                      type: string
 *       404:
 *         description: News Or Notice Not found
 *         content:
 *          application/json:
 *            schema:
 *             type: object
 *             properties:
 *              error:
 *                type: string
 *                examples: 'NewsNotice not found'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Internal Server Error"
 */
router.get("/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

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
    const NewsNotice = require('../models/newsandnotice.model')(
      sequelizeInstance, DataTypes
    )

    const newsNotice = await NewsNotice.findByPk(id); // Find the record by its primary key

    if (newsNotice) {
      logger.info('News notice get')
      res.status(200).json(newsNotice); // Return the found record
    } else {
      logger.error(`News notice get failed `)
      res.status(404).json({ error: "NewsNotice not found" }); // Return a 404 error if not found
    }
  } catch (error) {
    console.error(error);
    logger.error(`News notice get failed ${error} `)
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the news notice" }); // Handle any other errors
  }
});

//get all news and notices available

/**
 * @swagger
 * /newsnotices/get/all:
 *   get:
 *     summary: Retrieve all News and Notices
 *     description: Fetches details of a all News and Notice by it's ID.
 *     tags:
 *       - News And Notices
 *     responses:
 *       200:
 *        description: Details Of News and Notice
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 'Details Of News Or Notice'
 *                newsNotice:
 *                  type: object
 *                  properties:
 *                    Title:
 *                      type: string
 *                    Description:
 *                      type: string
 *                    Date:
 *                      type: string
 *                    ImagePath:
 *                      type: string
 *                    Status:
 *                      type: boolean
 *                    Type:
 *                      type: string
 *       404:
 *         description: News Or Notice Not found
 *         content:
 *          application/json:
 *            schema:
 *             type: object
 *             properties:
 *              error:
 *                type: string
 *                examples: 'NewsNotice not found'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "Internal Server Error"
 */

router.get("/get/all", authenticateJWT, async (req, res) => {
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
    const NewsNotice = require('../models/newsandnotice.model')(
      sequelizeInstance, DataTypes
    )

    const exnewsNotice = await NewsNotice.findAll(); // Find the record by its primary key

    if (exnewsNotice) {
      logger.info(`News Notice found`)
      res.status(200).json(exnewsNotice); // Return the found record
    } else {
      res.status(404).json({ error: "NewsNotice not found" }); // Return a 404 error if not found
    }
  } catch (error) {
    console.error(error);
    logger.error(`News notice get failed ${error} `)
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the news notice" }); // Handle any other errors
  }
});

/**
 * @swagger
 * /newsnotices/update/{Id}:
 *   put:
 *     summary: Updates The specific news or notice
 *     description: Update details of a specific News or notice by slider ID.
 *     tags:
 *       - News And Notices
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the slider to retrieve
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 description: Title Of the News or Notice
 *               Description:
 *                 type: string
 *                 description: Description of the News or Notice
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Image to be uploaded for the News or Notice
 *               Date:
 *                 type: string
 *                 format: date
 *                 description: Enter Date
 *               Status:
 *                 type: boolean
 *                 description: Status for the news or notice
 *               Type:
 *                 type: string
 *                 enum: [News,Notice]
 *                 description: Type News Or Notice
 *     responses:
 *       200:
 *        description: Details Of News and Notice
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 'Details Of News Or Notice'
 *                newsNotice:
 *                  type: object
 *                  properties:
 *                    Title:
 *                      type: string
 *                    Description:
 *                      type: string
 *                    Date:
 *                      type: string
 *                    ImagePath:
 *                      type: string
 *                    Status:
 *                      type: boolean
 *                    Type:
 *                      type: string
 *       404:
 *         description: News Or Notice Not found
 *         content:
 *          application/json:
 *            schema:
 *             type: object
 *             properties:
 *              error:
 *                type: string
 *                examples: 'NewsNotice not found'
 *       500:
 *         description: An error occurred while updating the news notice
 *         content:
 *           application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: "An error occurred while updating the news notice"
 */
router.put("/update/:Id", authenticateJWT, upload.single("Image"), async (req, res) => {
  const { Id } = req.params;
  const { Title, Description, Date, Status, Type } = req.body;
  const Image = req.file;
  let imagePath = null;

  if (Image) {
    imagePath = `http://localhost:3000/uploads/${Image.filename}`;
  }
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
    const NewsNotice = require('../models/newsandnotice.model')(
      sequelizeInstance, DataTypes
    )


    const existingnewsnotice = await NewsNotice.findByPk(Id);
    if (existingnewsnotice) {
      if (Image && existingnewsnotice.ImagePath) {
        // Delete the existing image from the file system
        const existingImagePath = existingnewsnotice.ImagePath.replace(
          "http://localhost:3000",
          "../uploads"
        ); // Assuming images are stored in the 'public' directory
        fs.unlinkSync(existingImagePath);

        // Delete the existing image from the database
        existingnewsnotice.ImagePath = null;
      }

      // Update the existing news notice
      existingnewsnotice.Title = Title || existingnewsnotice.Title;
      existingnewsnotice.Description =
        Description || existingnewsnotice.Description;
      existingnewsnotice.Date = Date || existingnewsnotice.Date;
      existingnewsnotice.Status = Status || !!existingnewsnotice.Status;
      existingnewsnotice.Type = Type || existingnewsnotice.Type;

      // Only update ImagePath if a new image is uploaded
      if (imagePath) {
        existingnewsnotice.ImagePath = imagePath;
      }

      // Save the updated record
      await existingnewsnotice.save();

      logger.info(`News Notice updated successfully with ID: ${Id}`);
      res.status(200).json(existingnewsnotice);
    } else {
      logger.error(`News Notice updated failed`)
      res.status(404).json({ error: "NewsNotice not found" });
    }
  } catch (error) {
    logger.error(`News Notice updated failed ${error}`)
    res
      .status(500)
      .json({ message: "An error occurred while updating the news notice" });
  }
});

/**
 * @swagger
 * /newsnotices/delete/{Id}:
 *   delete:
 *     summary: Delete a News or Notice
 *     description: Removes a specified News Or notice from table by it's Id.
 *     tags:
 *       - News And Notices
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the News or Notice to be deleted.
 *     responses:
 *       200:
 *         description: News or Notice deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "News or Notice deleted successfully"
 *       500:
 *         description: Failed to delete the associated image file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples: 'Failed to delete the associated image file'
 *       501:
 *         description: An error occurred while deleting the news notice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while deleting the news notice"
 *       404:
 *         description: News or Notice not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "News or Notice not found"
 */

router.delete("/delete/:Id",authenticateJWT, async (req, res) => {
  const { Id } = req.params;

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
    const NewsNotice = require('../models/newsandnotice.model')(
      sequelizeInstance, DataTypes
    )


    const newsnotice = await NewsNotice.findByPk(Id);
    if (!newsnotice) {
      return res.status(404).json({ message: "NewsNotice not found" });
    }
    if (newsnotice.ImagePath) {
      const imagePath = path.resolve(
        __dirname,
        "../uploads",
        path.basename(newsnotice.ImagePath)
      );
      fs.unlink(imagePath, (err) => {
        // if (err) {
        //   console.error("Failed to delete the image file:", err);
        //   return res
        //     .status(500)
        //     .json({ message: "Failed to delete the associated image file" });
        // }
        console.log("Image file deleted successfully");
      });
      // res.json(imagePath);
      // console.log(imagePath)
    }
    await newsnotice.destroy();
    logger.info(`News Notice deleted successfully with ID: ${Id}`);
    res.json({ message: "NewsNotice deleted successfully" });
  } catch (error) {
    logger.error(`News Notice deletion failed ${error}`);
    res
      .status(501)
      .json({ message: "An error occurred while deleting the news notice" });
  }
});

module.exports = router;


// PAGE VIEW MASTER NEXT