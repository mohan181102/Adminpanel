const express = require("express");
const app = express()
const router = express.Router();
const mdl = require("../models");
const logger = require("../utils/logger");
const authenticateJWT = require("../utils/JWTauth");
const getDbconnection = require("../DbConnection/CdConnection");
const { DataTypes } = require("sequelize");
app.use(express.urlencoded({ extended: true }));
// create a flashnews in the database

/**
 * @swagger
 * /flashnews/create:
 *   post:
 *     summary: Create Flashnews
 *     description: To create FlashNews .
 *     tags:
 *       - FlashNews
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               FlashNews:
 *                 type: string
 *                 description: Title Of the Flashnews
 *                 example: "Flash News"
 *               Date:
 *                 type: string
 *                 format: date
 *                 description: Enter Date in format(yyyy-mm-dd)
 *                 example: "2024-06-04"
 *               Status:
 *                 type: boolean
 *                 description: Status for the news or notice
 *               Priority:
 *                 type: integer
 *                 description: Priority Of the Flash News
 *     responses:
 *        201:
 *          description: FlashNews created successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 'Flash News Created Successfully'
 *                  FlashNews:
 *                    type: object
 *                    properties:
 *                      FlashNews:
 *                        type: string
 *                      Date:
 *                        type: string
 *                      Status:
 *                        type: boolean
 *                      Priority:
 *                        type: integer
 *        500:
 *          description: Error Creating FlashNews
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Error Creating FlashNews"
 */
router.post("/create", authenticateJWT, async (req, res) => {
  try {
    const { FlashNews, Date, Priority, Status } = req.body;
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
    const Flashnews = require('../models/flashnews.model')(
      sequelizeInstance, DataTypes
    )

    // res.json({ FlashNews, Date, Priority, Status });
    // console.log(req.body)
    const result = await Flashnews.create({
      FlashNews: FlashNews,
      Date: Date,
      Priority: Priority,
      Status: Status,
    });

    logger.info(`Flash News Create Success ${result}`)
    res
      .status(200)
      .send({ message: "Flash News Created Successfully", result });
  } catch (error) {
    console.error(error);
    logger.error(`Flash News Create Failed ${error}`)
    res.status(500).json({ message: "Error Creating FlashNews", error });
  }
});
//get all the flash news available in the database

/**
 * @swagger
 * /flashnews/get/all:
 *   get:
 *     summary: Get all Flashnews
 *     description: To Get the all Available Flashnews .
 *     tags:
 *       - FlashNews
 *     responses:
 *        200:
 *          description: FlashNews created successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 'All Flashnews Here'
 *                  FlashNews:
 *                    type: object
 *                    properties:
 *                      FlashNews:
 *                        type: string
 *                      Date:
 *                        type: string
 *                      Status:
 *                        type: boolean
 *                      Priority:
 *                        type: integer
 *        500:
 *          description: Error Getting FlashNews
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Error Getting FlashNews"
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
    const FNews = require('../models/flashnews.model')(
      sequelizeInstance, DataTypes
    )
    const result = await FNews.findAll();
    if (result) {
      logger.info(`Flash News Get All Success ${result}`)
      res.json({ message: "All FlashNews Available", result });
    }
  } catch (error) {
    logger.error(`Flash News Get All Failure ${error}`)
    res.status(500).json({ message: "Error Getting FlashNews", error });
  }
});


/**
 * @swagger
 * /flashnews/get/{Id}:
 *   get:
 *     summary: Get all Flashnews
 *     description: To Get the all Available Flashnews .
 *     tags:
 *       - FlashNews
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the FlashNews to retrieve
 *     responses:
 *        200:
 *          description: Flashnews retrived successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 'Get the specific Flashnews'
 *                  FlashNews:
 *                    type: object
 *                    properties:
 *                      FlashNews:
 *                        type: string
 *                      Date:
 *                        type: string
 *                      Status:
 *                        type: boolean
 *                      Priority:
 *                        type: integer
 *        500:
 *          description: Error Getting FlashNews
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Error Getting FlashNews"
 */
router.get("/get/:Id", authenticateJWT, async (req, res) => {
  try {
    const { Id } = req.params;
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
    const FNews = require('../models/flashnews.model')(
      sequelizeInstance, DataTypes
    )
    const result = await FNews.findByPk(Id);
    if (result) {
      logger.info(`Flash News Get By Id Success ${result}`)
      res.json({ message: "FlashNews Retrived", result });
    }
  } catch (error) {
    logger.error(`Flash News Get By Id Failure ${error}`)
    res.status(500).json({ message: "Error Getting FlashNews", error });
  }
});


/**
 * @swagger
 * /flashnews/update/{Id}:
 *   put:
 *     summary: Update The Flashnews
 *     description: To Update the FlashNews .
 *     tags:
 *       - FlashNews
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the FlashNews to Update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               FlashNews:
 *                 type: string
 *                 description: Title Of the Flashnews
 *                 example: "Flash News"
 *               Date:
 *                 type: string
 *                 format: date
 *                 description: Enter Date in format(yyyy-mm-dd)
 *                 example: "2024-06-04"
 *               Status:
 *                 type: boolean
 *                 description: Status for the news or notice
 *               Priority:
 *                 type: integer
 *                 description: Priority Of the Flash News
 *     responses:
 *        201:
 *          description: FlashNews Updated successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 'Flash News Updated Successfully'
 *                  FlashNews:
 *                    type: object
 *                    properties:
 *                      FlashNews:
 *                        type: string
 *                      Date:
 *                        type: string
 *                      Status:
 *                        type: boolean
 *                      Priority:
 *                        type: integer
 *        500:
 *          description: Error Updating FlashNews
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Error Updating FlashNews"
 */
router.put("/update/:Id", authenticateJWT, async (req, res) => {
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
    const FNews = require('../models/flashnews.model')(
      sequelizeInstance, DataTypes
    )

    const { Id } = req.params;
    const { FlashNews, Date, Priority, Status } = req.body;
    const existingflashnews = await FNews.findByPk(Id);
    if (existingflashnews) {
      if (FlashNews) existingflashnews.FlashNews = FlashNews;
      if (Date) existingflashnews.Date = Date;
      if (Priority) existingflashnews.Priority = Priority;
      if (Status) existingflashnews.Status = Status;

      // Save the updated record
      await existingflashnews.save();

      logger.info(`Flash news Update successfully`)
      // Send a success response
      res.status(200).json({
        message: "FlashNews updated successfully",
        data: existingflashnews,
      });
    }
  } catch (error) {
    logger.error(`Flash News Update Failure ${error}`)
    res.status(500).json({ message: "Error Updating FlashNews", error });
  }
});

/**
 * @swagger
 * /flashnews/delete/{Id}:
 *   delete:
 *     summary: To delete Flashnews
 *     description: To Delete Flashnews by it's Id.
 *     tags:
 *       - FlashNews
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the FlashNews to Delete
 *     responses:
 *        200:
 *          description: Flashnews retrived successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 'Get the specific Flashnews'
 *                  FlashNews:
 *                    type: object
 *                    properties:
 *                      FlashNews:
 *                        type: string
 *                      Date:
 *                        type: string
 *                      Status:
 *                        type: boolean
 *                      Priority:
 *                        type: integer
 *        500:
 *          description: Error Getting FlashNews
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: "Error Getting FlashNews"
 */
router.delete("/delete/:Id",authenticateJWT, async (req, res) => {
  try {
    const { Id } = req.params;
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
    const FNews = require('../models/flashnews.model')(
      sequelizeInstance, DataTypes
    )
    const result = await FNews.findByPk(Id);
    if (result) {
      await result.destroy();
      logger.info(`Flash news Delete Success ${result}`)
      res.status(200).json({
        message: "FlashNews has been deleted Succefully",
        data: result,
      });
    }
  } catch (error) {
    logger.error(`Flash News Delete Failure ${error}`)
    res.status(500).json({ message: "Error Deleting FlashNews", error });
  }
});

module.exports = router;
