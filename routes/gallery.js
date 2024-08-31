const express = require("express");
const router = express.Router();

const mdl = require("../models");
const path = require("path");
const fs = require("fs");

const upload = require("../utils/upload");
const authenticateJWT = require("../utils/JWTauth");
const logger = require("../utils/logger");
const getDbconnection = require("../DbConnection/CdConnection");
const { DataTypes } = require("sequelize");

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
    } else {
      console.log(`File deleted: ${filePath}`);
    }
  });
}


/**
 * @swagger
 * /gallery/images/all:
 *   get:
 *     summary: Retrieve all images
 *     description: Retrieves all images grouped by their name.
 *     tags:
 *       - Gallery
 *     responses:
 *       200:
 *         description: Successfully retrieved images
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     Name:
 *                       type: string
 *                     Url:
 *                       type: string
 *                   example:
 *                     - id: 1
 *                       Name: 'image1'
 *                       Url: 'http://example.com/image1.jpg'
 *                     - id: 2
 *                       Name: 'image1'
 *                       Url: 'http://example.com/image2.jpg'
 *       404:
 *         description: No images found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No images found'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Internal server error'
 */
router.get("/images/all", authenticateJWT, async (req, res) => {
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
    const Gallery = require('../models/gallery.model')(
      sequelizeInstance, DataTypes
    )

    const images = await Gallery.findAll();
    if (!images || images.length === 0) {
      return res.status(404).json({ message: "No images found" });
    }

    const groupedImages = images.reduce((acc, image) => {
      const name = image.Name;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(image);
      return acc;
    }, {});

    logger.info(`Image retrieved successfully: ${groupedImages}`)
    res.status(200).json({ groupedImages });
  } catch (error) {
    console.error("Error retrieving images:", error);
    logger.error(`Image retrieved failed ERROR:${error}`);
    res
      .status(500)
      .json({ message: "Error retrieving images", error: error.message });
  }
});

/**
 * @swagger
 * /gallery/uploads:
 *   post:
 *     summary: Create and Upload images to a gallery
 *     description: Allows uploading multiple images to a specified gallery.
 *     tags:
 *       - Gallery
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               Name:
 *                 type: string
 *                 description: Name of the gallery
 *     responses:
 *       201:
 *         description: Images successfully uploaded and saved to the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Name:
 *                         type: string
 *                       Imagepath:
 *                         type: string
 *       500:
 *         description: Error uploading image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error uploading image'
 */

router.post("/uploads", authenticateJWT, upload.array("Image"), async (req, res) => {
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
    const Gallery = require('../models/gallery.model')(
      sequelizeInstance, DataTypes
    )

    const { Name } = req.body;

    const imageUrls = req.files.map((file) => {
      return {
        Name: Name,
        Imagepath: `${req.protocol}://${req.get("host")}/uploads/${file.filename
          }`,
      };
    });
    // res.send({Name,imageurls});
    const image = await Gallery.bulkCreate(imageUrls);
    logger.info(`Gallery Upload successsfully`)
    res.status(201).send({ image });
  } catch (error) {
    console.error("Error uploading image:", error);
    logger.error(`Gallery Upload error: ${error}`)
    res.status(500).json({ message: "Error uploading image", error });
  }
});


/**
 * @swagger
 * /gallery/image/{id}:
 *   delete:
 *     summary: Delete an image from the gallery
 *     description: Deletes a specified image from the gallery by image ID.
 *     tags:
 *       - Gallery
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the image to be deleted
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image deleted successfully"
 *                 fileName:
 *                   type: string
 *                   example: "example.jpg"
 *       404:
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image not found"
 *       500:
 *         description: Error deleting image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting image"
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.delete("/image/:id", authenticateJWT, async (req, res) => {
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
    const Gallery = require('../models/gallery.model')(
      sequelizeInstance, DataTypes
    )

    const image = await Gallery.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    const imageUrl = image.Imagepath; // Assuming the field is called Imagepath
    const fileName = imageUrl.split("/").pop();
    const filePath = path.join(__dirname, "../uploads", fileName);
    // res.send(filePath)
    await image.destroy();
    deleteFile(filePath);
    logger.info(`Gallery delete successfully`)
    res.status(200).json({ message: "Image deleted successfully", fileName });
  } catch (error) {
    console.error("Error deleting image:", error);
    logger.error(`Gallery delete error: ${error}`)
    res
      .status(500)
      .json({ message: "Error deleting image", error: error.message });
  }
});


/**
 * @swagger
 * /gallery/{name}:
 *   delete:
 *     summary: Delete an album by name
 *     description: Deletes the specified album and all associated images.
 *     tags:
 *       - Gallery
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: Name of the album to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Album and all associated images deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Album and all associated images deleted successfully'
 *       404:
 *         description: Album not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Album not found'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Internal server error'
 */
router.delete("/:name", authenticateJWT, async (req, res) => {
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
    const Gallery = require('../models/gallery.model')(
      sequelizeInstance, DataTypes
    )

    // Find the album by its name
    const album = await Gallery.findAll({
      where: { name: req.params.name },
    });
    // res.json(album);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    for (const image of album) {
      const imageUrl = image.Imagepath;
      const fileName = imageUrl.split("/").pop();
      const filePath = path.join(__dirname, "../uploads", fileName);
      console.log(`Deleting file: ${filePath}`);

      deleteFile(filePath);

      await image.destroy();
    }

    logger.info(`Delete gallery successfully ${this.name}`)
    res.status(200).json({
      message: "Album and all associated images deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting gallery ${error}`)
    console.error(error);
  }
});

/**
 * @swagger
 * /gallery/selectedgalleries/deletegalleries:
 *   delete:
 *     summary: Delete selected galleries
 *     description: Deletes the specified galleries and all associated images.
 *     tags:
 *       - Gallery
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               items: ["Nameofgallery1", "Nameofgallery2"]
 *     responses:
 *       200:
 *         description: Albums and all associated images deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Albums and all associated images deleted successfully'
 *       400:
 *         description: No galleries selected for deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No galleries selected for deletion'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Internal server error'
 */
router.delete("/selectedgalleries/deletegalleries", authenticateJWT, async (req, res) => {
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
    const Gallery = require('../models/gallery.model')(
      sequelizeInstance, DataTypes
    )
    const selectedGalleries = req.body.items;
    console.log(selectedGalleries);

    if (!selectedGalleries || selectedGalleries.length === 0) {
      return res
        .status(400)
        .json({ message: "No galleries selected for deletion" });
    }
    for (const galleryName of selectedGalleries) {
      const galleries = await Gallery.findAll({
        where: { Name: galleryName },
      });

      for (const gallery of galleries) {
        const imageUrl = gallery.Imagepath; // Assuming the field is called Imagepath
        const fileName = imageUrl.split("/").pop();
        const filePath = path.join(__dirname, "../uploads", fileName);
        deleteFile(filePath);
        await gallery.destroy();
      }
    }

    logger.info(`Deleting gallery successfully`)
    res.status(200).json({
      message: "Albums and all associated images deleted successfully",
    });
    // console.log("this api is called");
  } catch (error) {
    logger.error(`Error while deleting gallery ${error}`)
    console.error("Error deleting galleries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /gallery/images/name:
 *   put:
 *     summary: Update gallery name and optionally upload an image
 *     description: Updates the name of a gallery and optionally uploads a new image associated with the new gallery name.
 *     tags:
 *       - Gallery
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               oldName:
 *                 type: string
 *                 description: The old name of the gallery
 *               newName:
 *                 type: string
 *                 description: The new name of the gallery
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Optional new image to upload
 *     responses:
 *       200:
 *         description: Successfully updated the gallery name and uploaded the new image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Successfully updated all occurrences of {oldName} to {newName}'
 *       404:
 *         description: No records found to update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No records found to update'
 *       500:
 *         description: Error updating names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error updating names'
 *                 error:
 *                   type: string
 *                   example: 'Error details'
 */
router.put("/images/name", authenticateJWT, upload.single("Image"), async (req, res) => {
  const { oldName, newName } = req.body;

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
    const Gallery = require('../models/gallery.model')(
      sequelizeInstance, DataTypes
    )
    const [updated] = await Gallery.update(
      { Name: newName },
      { where: { Name: oldName } }
    );

    let imageUrl = null;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename
        }`;

      // Assuming you want to save the image URL in the database
      const image = await Gallery.create(
        { Name: newName, Imagepath: imageUrl },
        { where: { Name: newName } }
      );
    }

    if (updated) {
      res.status(200).json({
        message: `Successfully updated all occurrences of ${oldName} to ${newName}`,
      });
      logger.info(`Successfully Gallery updated`)
    } else {
      res.status(404).json({ message: "No records found to update" });
    }
  } catch (error) {
    console.error("Error updating names:", error);
    logger.error(`Gallery Update Error:${error}`)
    res
      .status(500)
      .json({ message: "Error updating names", error: error.message });
  }
});

module.exports = router;
