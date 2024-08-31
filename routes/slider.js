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
 * /api/sliders:
 *   post:
 *     summary: Create a new slider with multiple images
 *     description: Creates a new slider and uploads multiple images associated with it.
 *     tags:
 *       - Slider
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 description: Name of the slider
 *                 example: 'mySlider'
 *               Image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images to be uploaded for the slider
 *     responses:
 *       201:
 *         description: Slider created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Slider created successfully'
 *                 slider:
 *                   type: object
 *                   properties:
 *                     SliderName:
 *                       type: string
 *                     Imagepaths:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Slider with the same name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Slider with the same name already exists'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Internal server error'
 */
router.post("/sliders", authenticateJWT, upload.array("Image"), async (req, res) => {
  const Images = req.files.map((file) => {
    return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
  });
  const { Name } = req.body;

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
    const Slider = require('../models/slider.model')(
      sequelizeInstance, DataTypes
    )

    const existingSlider = await Slider.findOne({
      where: { SliderName: Name },
    });
    if (existingSlider) {
      return res
        .status(400)
        .json({ error: "Slider with the same name already exists" });
    }

    const slider = await Slider.create({
      SliderName: Name,
      Imagepaths: Images,
    });

    logger.info(`Slider Created Successfully`)
    res.status(201).json({ message: "Slider created successfully", slider });
  } catch (error) {
    logger.error(`Error creating slider: ${error.message}`)
    console.error("Error creating Slider:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/sliders/{sliderId}/images:
 *   post:
 *     summary: Add a new image to an existing slider
 *     description: Adds a new image to the specified slider and optionally updates the slider name.
 *     tags:
 *       - Slider
 *     parameters:
 *       - in: path
 *         name: sliderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the slider to which the image will be added
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *                 description: New name for the slider (optional)
 *                 example: 'newSliderName'
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Image to be added to the slider
 *     responses:
 *       200:
 *         description: Image added to Slider successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Image added to Slider successfully'
 *                 slider:
 *                   type: object
 *                   properties:
 *                     SliderName:
 *                       type: string
 *                     Imagepaths:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Slider not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Slider not found'
 *       409:
 *         description: Image already exists in the slider
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Image already exists in the slider'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Internal server error'
 */
router.post(
  "/sliders/:sliderId/images",
  authenticateJWT,
  upload.single("Image"),
  async (req, res) => {
    const sliderId = req.params.sliderId;
    const { newName } = req.body;

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename
      }`;

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
      const Slider = require('../models/slider.model')(
        sequelizeInstance, DataTypes
      )

      const slider = await Slider.findByPk(sliderId);
      if (!slider) {
        return res.status(404).json({ error: "Slider not found" });
      }
      slider.SliderName = newName;

      // Add the new image URL to the existing imageUrls array
      // slider.Imagepaths.push(imageUrl);
      if (slider.Imagepaths.includes(imageUrl)) {
        return res
          .status(409)
          .json({ error: "Image already exists in the slider" });
      }

      slider.Imagepaths = slider.Imagepaths.concat([imageUrl]);

      await slider.save();

      logger.info(`Image add to slider successfully`)
      res.json({ message: "Image added to Slider successfully", slider });
    } catch (error) {
      logger.error(`Error adding image to Slider: ${error.message}`)
      console.error("Error adding image to Slider:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


/**
* @swagger
* /api/sliders/all:
*   get:
*     summary: Retrieve all sliders
*     description: Fetches all sliders from the database along with their details.
*     tags:
*       - Slider
*     responses:
*       200:
*         description: A list of sliders
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   Id:
*                     type: integer
*                   SliderName:
*                     type: string
*                   Imagepaths:
*                     type: array
*                     items:
*                       type: string
*       500:
*         description: Internal server error
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: 'Internal server error'
*/
router.get("/sliders/all", authenticateJWT, async (req, res) => {
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
    const Slider = require('../models/slider.model')(
      sequelizeInstance, DataTypes
    )

    // Retrieve all sliders from the database
    const sliders = await Slider.findAll({
      attributes: ["Id", "SliderName", "Imagepaths"], // Specify the fields you want to retrieve
    });

    // Send the sliders as a JSON response
    logger.info(`All slider get successfully`)
    res.json(sliders);
  } catch (error) {
    logger.error(`Error getting sliders ERROR:${error}`)
    console.error("Error fetching sliders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
* @swagger
* /api/sliders/{sliderId}:
*   get:
*     summary: Retrieve a specific slider
*     description: Fetches details of a specific slider by slider ID.
*     tags:
*       - Slider
*     parameters:
*       - in: path
*         name: sliderId
*         required: true
*         schema:
*           type: integer
*         description: The ID of the slider to retrieve
*     responses:
*       200:
*         description: Details of the slider
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 slider:
*                   type: object
*                   properties:
*                     SliderName:
*                       type: string
*                     Imagepaths:
*                       type: array
*                       items:
*                         type: string
*       404:
*         description: Slider not found
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Slider not found"
*       500:
*         description: Internal server error
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Internal server error"
*/
router.get("/sliders/:sliderId", authenticateJWT, async (req, res) => {
  const sliderId = req.params.sliderId;

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
    const Slider = require('../models/slider.model')(
      sequelizeInstance, DataTypes
    )
    const slider = await Slider.findByPk(sliderId);
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" });
    }

    logger.info(`Slider get successfully with ID: ${sliderId}`)
    res.json({ slider });
  } catch (error) {
    logger.error(`Error getting Slider with ID: ${sliderId} ERROR:${error}`)
    console.error("Error retrieving Slider:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
* @swagger
* /api/sliders/{sliderId}:
*   delete:
*     summary: Delete a slider
*     description: Delete a specific slider by slider ID.
*     tags:
*       - Slider
*     parameters:
*       - in: path
*         name: sliderId
*         required: true
*         schema:
*           type: integer
*         description: The ID of the slider to delete
*     responses:
*       200:
*         description: Details of the slider
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 slider:
*                   type: object
*                   properties:
*                     SliderName:
*                       type: string
*                     Imagepaths:
*                       type: array
*                       items:
*                         type: string
*       404:
*         description: Slider not found
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Slider not found"
*       500:
*         description: Internal server error
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Internal server error"
*/
router.delete("/sliders/:sliderId", authenticateJWT, async (req, res) => {
  const sliderId = req.params.sliderId;

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
    const Slider = require('../models/slider.model')(
      sequelizeInstance, DataTypes
    )

    // Find the Slider by ID
    const slider = await Slider.findByPk(sliderId);
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" });
    }

    const imagePaths = slider.Imagepaths;
    imagePaths.forEach((imagePath) => {
      const filePath = path.join(
        __dirname,
        "../uploads",
        path.basename(imagePath)
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        } else {
          console.log(`Successfully deleted file ${filePath}`);
        }
      });
    });

    // Delete the Slider from the database
    await slider.destroy();

    logger.info(`Slider deleted successfully with ID: ${sliderId}`)
    res.json({ message: "Slider deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting Slider with ID: ${sliderId} ERROR:${error}`)
    console.error("Error deleting Slider:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


//api to delete single image from the slider

/**
 * @swagger
 * /api/sliders/{sliderId}/images:
 *   delete:
 *     summary: Delete an image from a slider
 *     description: Removes a specified image from a slider's image collection based on the slider ID and the image path provided.
 *     tags:
 *       - Slider
 *     parameters:
 *       - in: path
 *         name: sliderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the slider from which the image will be deleted.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imagePath:
 *                 type: string
 *                 description: The full path of the image to be deleted.
 *
 *     responses:
 *       200:
 *         description: Image successfully deleted from the slider.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image deleted successfully from slider"
 *       404:
 *         description: Slider or image not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     Slider not found: "Slider not found"
 *                     Image not found: "Image not found in slider"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.delete("/sliders/:sliderId/images",authenticateJWT, async (req, res) => {
  const sliderId = req.params.sliderId;
  const imagePathToDelete = req.body.imagePath;

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
    const Slider = require('../models/slider.model')(
      sequelizeInstance, DataTypes
    )

    // Find the Slider by ID
    const slider = await Slider.findByPk(sliderId);

    if (!slider) {
      return res.status(404).json({ error: "Slider not found" });
    }
    // console.log(imagePathToDelete);
    const filenameToDelete = path.basename(imagePathToDelete);
    // Check if the image path exists in the slider
    const imagePaths = slider.Imagepath;
    const imageIndex = imagePaths.findIndex(
      (imagePath) => path.basename(imagePath.Imagepath) === filenameToDelete
    );
    if (imageIndex === -1) {
      return res.status(404).json({ error: "Image not found in slider" });
    }

    // Delete the image file from /uploads folder
    const filePath = path.join(
      __dirname,
      "../uploads",
      path.basename(imagePathToDelete)
    );
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file ${filePath}:`, err);
        return res.status(500).json({ error: "Error deleting image file" });
      } else {
        console.log(`Successfully deleted file ${filePath}`);
      }
    });

    // Remove the image path from the slider's Imagepaths array
    imagePaths.splice(imageIndex, 1);
    // slider.Imagepaths = imagePaths;

    // Save the updated slider
    // await slider.save();
    await Slider.update(
      { Imagepaths: imagePaths },
      { where: { id: sliderId } }
    );

    logger.info(`Image deleted successfully from Slider with ID: ${sliderId}`)
    res.json({ message: "Image deleted successfully from slider" });
  } catch (error) {
    console.error("Error deleting image from slider:", error);
    logger.error(`Error deleting image from Slider with ID: ${sliderId} ERROR:${error}`)
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
