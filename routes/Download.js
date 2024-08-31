const express = require("express");
const router = express.Router();

const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const logger = require("../utils/logger");
const authenticateJWT = require("../utils/JWTauth");
const getDbconnection = require("../DbConnection/CdConnection");
const { DataTypes } = require("sequelize");


/**
 * @swagger
 * components:
 *   schemas:
 *     Download:
 *       type: object
 *       required:
 *         - Title
 *         - URL
 *         - Status
 *       properties:
 *         Title:
 *           type: string
 *           description: Title of the download.
 *           example: Example Title
 *         URL:
 *           type: string
 *           description: URL of the download.
 *           example: http://example.com/download
 *         Status:
 *           type: boolean
 *           description: Status of the download (true for active, false for inactive).
 *           example: true
 *         Filepath:
 *           type: string
 *           description: Path to the uploaded image (optional).
 * 
 * /Download/create:
 *   post:
 *     summary: Create a new download
 *     tags:
 *       - Downloads
 *     description: Endpoint to create a new download entry. Accepts multipart/form-data for file uploads.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 description: Title of the download.
 *                 example: Example Title
 *               URL:
 *                 type: string
 *                 description: URL of the download.
 *                 example: http://example.com/download
 *               Status:
 *                 type: boolean
 *                 description: Status of the download (true for active, false for inactive).
 *                 example: true
 *               Filepath:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the download (optional).
 *     responses:
 *       201:
 *         description: Download created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating the download creation.
 *                   example: Download created successfully
 *                 Download:
 *                   $ref: '#/components/schemas/Download'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message in case of internal server issues.
 *                   example: Internal server error
 */
router.post("/create", authenticateJWT, upload.single("file"), async (req, res) => {
  const { Title, URL, Status } = req.body;
  const file = req.file;
  console.log("file", file)
  var FilePath = null;

  if (file != null) {
    FilePath = `http://localhost:3000/uploads/${file.filename}`;
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
    const Download = require('../models/Download')(
      sequelizeInstance, DataTypes
    )

    const newDownload = await Download.create({
      Title: Title,
      URL: URL,
      Filepath: FilePath,
      Status: Status,
    });

    logger.info(`Download created successfully`);
    res.status(201).json({
      message: "Download created successfully",
      Downloads: newDownload,
    });
  } catch (error) {
    console.error(error);
    logger.error(`Error while Download Creating ERROR:${error}`)
    res.status(500).json({ error: "Internal server error" });
  }
});



/**
 * @swagger
 * components:
 *   schemas:
 *     Download:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: Unique identifier for the download.
 *           example: 1
 *         Title:
 *           type: string
 *           description: Title of the download.
 *           example: Example Title
 *         URL:
 *           type: string
 *           description: URL of the download.
 *           example: http://example.com/download
 *         Filepath:
 *           type: string
 *           description: File associated with the download (optional).
 *           example: file.pdf
 *         Status:
 *           type: boolean
 *           description: Status of the download (true for active, false for inactive).
 *           example: true
 * 
 * /Download/{id}:
 *   get:
 *     summary: Get a download by ID
 *     tags:
 *       - Downloads
 *     description: Retrieve a download record by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the download to retrieve.
 *     responses:
 *       200:
 *         description: Successful retrieval of download
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Download'
 *       404:
 *         description: Download not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Download not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while retrieving the download
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
    const Download = require('../models/Download')(
      sequelizeInstance, DataTypes
    )

    const download = await mdl.db.Download.findByPk(id); // Find the record by its primary key

    if (download) {
      logger.info(`Download Get Successfully ${id}`)
      res.status(200).json(Download); // Return the found record
    } else {
      res.status(404).json({ error: "Download not found" }); // Return a 404 error if not found
    }
  } catch (error) {
    console.error("Error fetching download:", error);
    logger.error(`Error while Download Get ERROR:${error}`)
    res.status(500).json({ error: "An error occurred while retrieving the download" }); // Handle any other errors
  }
});




/**
 * @swagger
 * components:
 *   schemas:
 *     Download:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: Unique identifier for the download.
 *           example: 1
 *         Title:
 *           type: string
 *           description: Title of the download.
 *           example: Example Title
 *         URL:
 *           type: string
 *           description: URL of the download.
 *           example: http://example.com/download
 *         Filepath:
 *           type: string
 *           description: File associated with the download (optional).
 *           example: file.pdf
 *         Status:
 *           type: boolean
 *           description: Status of the download (true for active, false for inactive).
 *           example: true
 * 
 * /Download/get/all:
 *   get:
 *     summary: Get a download by ID
 *     tags:
 *       - Downloads
 *     description: Retrieve a download record by its ID.
 *     responses:
 *       200:
 *         description: Successful retrieval of download
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Download'
 *       404:
 *         description: Download not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Download not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while retrieving the download
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
    const Download = require('../models/Download')(
      sequelizeInstance, DataTypes
    )
    const download = await Download.findAll(); // Find the record by its primary key

    if (download) {
      res.status(200).json(download); // Return the found record
    } else {
      res.status(404).json({ error: "Download not found" }); // Return a 404 error if not found
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the news notice" }); // Handle any other errors
  }
});



/**
 * @swagger
 * components:
 *   schemas:
 *     Download:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: Unique identifier for the download.
 *           example: 1
 *         Title:
 *           type: string
 *           description: Title of the download.
 *           example: Example Title
 *         URL:
 *           type: string
 *           description: URL of the download.
 *           example: http://example.com/download
 *         ImagePath:
 *           type: string
 *           description: Path to the image associated with the download (optional).
 *           example: http://localhost:3000/uploads/image.jpg
 *         Status:
 *           type: boolean
 *           description: Status of the download (true for active, false for inactive).
 *           example: true
 * 
 * /Download/update/{Id}:
 *   put:
 *     summary: Update a download by ID
 *     tags:
 *       - Downloads
 *     description: Update an existing download by its ID. Accepts multipart/form-data for image uploads.
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the download to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 description: Title of the download.
 *                 example: Updated Title
 *               URL:
 *                 type: string
 *                 description: URL associated with the download.
 *                 example: http://example.com/updated
 *               Status:
 *                 type: boolean
 *                 description: Status of the download (true for active, false for inactive).
 *                 example: false
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the download (optional).
 *     responses:
 *       200:
 *         description: Download updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Download'
 *       404:
 *         description: Download not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Download not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while updating the download
 */

router.put("/update/:Id", authenticateJWT, upload.single("file"), async (req, res) => {
  const { Id } = req.params;
  const { Title, URL, Status, file } = req.body;
  const Image = req.file;
  let imagePath = null;

  if (Image) {
    imagePath = `http://localhost:3000/uploads/${Image.originalname}`;
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
    const Download = require('../models/Download')(
      sequelizeInstance, DataTypes
    )
    const existingDownload = await Download.findByPk(Id);

    if (existingDownload) {
      // Delete the existing image if a new image is uploaded
      if (Image && existingDownload.Filepath) {
        const existingImagePath = existingDownload.Filepath.replace(
          "http://localhost:3000",
          "../node js sequlize test project"
        );
        fs.unlinkSync(existingImagePath);
        existingDownload.Filepath = null;
      }

      // Update download properties
      existingDownload.Title = Title;
      existingDownload.URL = URL;
      existingDownload.Filepath = imagePath || existingDownload.Filepath;
      existingDownload.Status = Status;

      // Save the updated record
      await existingDownload.save();

      logger.info(`Download successfully updated ${Id}`)
      res.status(200).json(existingDownload);
    } else {
      res.status(404).json({ error: "Download not found" });
    }
  } catch (error) {
    console.error(error);
    logger.info(`Download failed ERROR:${error}`)
    res.status(500).json({ error: "An error occurred while updating the download" });
  }
});







/**
 * @swagger
 * components:
 *   schemas:
 *     Download:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: Unique identifier for the download.
 *           example: 1
 *         Image1:
 *           type: string
 *           description: Path to associated image 1.
 *           example: image1.jpg
 *         Image2:
 *           type: string
 *           description: Path to associated image 2.
 *           example: image2.jpg
 *         Image3:
 *           type: string
 *           description: Path to associated image 3.
 *           example: image3.jpg
 *         Image4:
 *           type: string
 *           description: Path to associated image 4.
 *           example: image4.jpg
 *         Image5:
 *           type: string
 *           description: Path to associated image 5.
 *           example: image5.jpg
 *         Image6:
 *           type: string
 *           description: Path to associated image 6.
 *           example: image6.jpg
 *         Image7:
 *           type: string
 *           description: Path to associated image 7.
 *           example: image7.jpg
 *         Image8:
 *           type: string
 *           description: Path to associated image 8.
 *           example: image8.jpg
 *         Image9:
 *           type: string
 *           description: Path to associated image 9.
 *           example: image9.jpg
 * 
 * /Download/{productId}:
 *   delete:
 *     summary: Delete a download by ID
 *     tags:
 *       - Downloads
 *     description: Delete a download record and associated images by its ID.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the download to delete.
 *     responses:
 *       200:
 *         description: Successful deletion of download
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Download 1 deleted successfully
 *       404:
 *         description: Download not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Download not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */






router.delete('/:productId', authenticateJWT, async (req, res) => {
  const { productId } = req.params;

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
    const Download = require('../models/Download')(
      sequelizeInstance, DataTypes
    )

    // Check if product exists
    const product = await Download.findByPk(productId);
    if (!product) {

      return res.status(404).json({ message: 'Download not found' });
    }

    // Delete associated images
    for (let i = 1; i <= 9; i++) {
      const fieldName = `Image${i}`;
      if (product[fieldName]) {
        const filePath = path.join(__dirname, '../uploads', path.basename(product[fieldName]));
        deleteFile(filePath);
      }
    }

    // Delete the product
    await product.destroy();

    logger.info(`Download deleted successfully ${productId}`)
    res.json({
      message: `Download ${productId} deleted successfully`
    });
  } catch (err) {
    console.error(err);
    logger.info(`Download deletion failed ERROR:${err}`)
    res.status(500).json({ message: 'Server error' });
  }
});

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    } else {
      console.log(`Deleted file: ${filePath}`);
    }
  });
};



/**
 * @swagger
 * /Download/delete/all:
 *   delete:
 *     summary: Delete all downloads
 *     tags:
 *       - Downloads
 *     description: Deletes all records in the Download table and resets auto-increment columns.
 *     responses:
 *       200:
 *         description: All downloads deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All downloads deleted successfully
 *       404:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */


// ALL DELETE
router.delete("/delete/all",authenticateJWT, async function (req, res) {
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
    const Download = require('../models/Download')(
      sequelizeInstance, DataTypes
    )

    const allDownloaddelete = await Download.destroy({
      where: {}, // corrected typo from 'were' to 'where'
      // truncate: true, // this option helps to reset the auto-increment column
    });

    if (allDownloaddelete) {
      logger.info("All downloads deleted successfully")
      return res.status(200).json({ message: "All downloads deleted successfully" });
    } else {
      return res.status(404).json({ message: "Something went wrong" });
    }
  } catch (error) {
    console.error(error);
    logger.error(`Error deleting download ERROR:${error}`)
    return res.status(500).json({ error: "Internal server error" });
  }
});




module.exports = router;
