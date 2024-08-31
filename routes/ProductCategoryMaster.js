const express = require('express');
const router = express.Router();

const mdl = require("../models");
const path = require("path");
const fs = require("fs");

const upload = require("../utils/upload");
const authenticateJWT = require('../utils/JWTauth');
const getDbconnection = require('../DbConnection/CdConnection');
const { DataTypes } = require('sequelize');
const logger = require('../utils/logger');


/**
 * @swagger
 * /productCategoryMaster/create:
 *   post:
 *     summary: Create a new product category
 *     tags: [ProductCategoryMaster]
 *     description: Create a new product category with optional image upload.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               CategoryName:
 *                 type: string
 *                 description: The name of the product category.
 *                 example: Electronics
 *               URL:
 *                 type: string
 *                 description: The URL path of the product category.
 *                 example: electronics
 *               Priority:
 *                 type: integer
 *                 description: The priority of the product category.
 *                 example: 1
 *               ShowOnCategory:
 *                 type: boolean
 *                 description: Whether to display on the category page.
 *                 example: true
 *               ShowCategoryList:
 *                 type: boolean
 *                 description: Whether to include in the category list.
 *                 example: true
 *               Status:
 *                 type: boolean
 *                 description: The status of the product category.
 *                 example: true
 *               Description:
 *                 type: string
 *                 description: The Description of the product category.
 *                 example: <>
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file for the product category.
 *     responses:
 *       201:
 *         description: Successfully created a new product category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ProductCategoryMaster created successfully
 *                 ProductCategoryMaster:
 *                   $ref: '#/components/schemas/ProductCategoryMaster'
 *       500:
 *         description: Server error
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/create", authenticateJWT, upload.single("Image"), async (req, res) => {
    const { CategoryName, URL, Priority, ShowOnCategory, ShowCategoryList, Status, Description } = req.body;
    const Image = req.file;
    let imagePath = null;

    if (Image) {
        imagePath = `${req.protocol}://${req.get("host")}/uploads/${Image.filename}`;
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
        const ProductCategoryMaster = require('../models/ProductCategoryMaster')(
            sequelizeInstance, DataTypes
        )

        const newProductCategoryMaster = await ProductCategoryMaster.create({
            CategoryName: CategoryName,
            URL: URL,
            Imagepaths: imagePath,
            Priority: Priority,
            ShowOnCategory: ShowOnCategory,
            ShowCategoryList: ShowCategoryList,
            Status: Status,
            Description: Description,
        });

        logger.info(`ProductCategoryMaster created successfully`)

        res.status(200).json({
            message: "ProductCategoryMaster created successfully",
            ProductCategoryMaster: newProductCategoryMaster,
        });
    } catch (error) {
        console.error(error);
        logger.error(`ProductCategoryMaster creation failed: ${error.message}`)
        res.status(500).json({ error: "Internal server error" });
    }
});


/**
 * @swagger
 * /productCategoryMaster/{id}:
 *   get:
 *     summary: Get a product category by ID
 *     tags: [ProductCategoryMaster]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product category to get
 *     responses:
 *       200:
 *         description: Successfully retrieved the product category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductCategoryMaster'
 *             example:
 *               Id: 1
 *               CategoryName: Electronics
 *               URL: electronics
 *               ImagePath: http://localhost:3000/uploads/electronics.jpg
 *               Priority: 1
 *               ShowOnCategory: true
 *               ShowCategoryList: true
 *               Status: true
 *       404:
 *         description: Product category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product category not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
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
        const ProductCategoryMasters = require('../models/ProductCategoryMaster')(
            sequelizeInstance, DataTypes
        )
        const ProductCategoryMaster = await ProductCategoryMasters.findByPk(id); // Find the record by its primary key

        if (ProductCategoryMaster) {
            logger.info('Successfully Get ProductCategoryMaster')
            res.status(200).json(ProductCategoryMaster); // Return the found record
        } else {
            res.status(404).json({ error: "ExProductCategoryMaster not found" }); // Return a 404 error if not found
        }
    } catch (error) {
        logger.error(error)
        console.error(error);
        res
            .status(500)
            .json({ error: "An error occurred while retrieving the news notice" }); // Handle any other errors
    }
});



/**
 * @swagger
 * /productCategoryMaster/get/all:
 *   get:
 *     summary: Get all product categories
 *     tags: [ProductCategoryMaster]
 *     responses:
 *       200:
 *         description: Successfully retrieved all product categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductCategoryMaster'
 *             example:
 *               - Id: 1
 *                 CategoryName: Electronics
 *                 URL: electronics
 *                 ImagePath: http://localhost:3000/uploads/electronics.jpg
 *                 Priority: 1
 *                 ShowOnCategory: true
 *                 ShowCategoryList: true
 *                 Status: true
 *               - Id: 2
 *                 CategoryName: Clothing
 *                 URL: clothing
 *                 ImagePath: http://localhost:3000/uploads/clothing.jpg
 *                 Priority: 2
 *                 ShowOnCategory: true
 *                 ShowCategoryList: true
 *                 Status: true
 *       404:
 *         description: No product categories found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No product categories found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
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
        const ProductCategoryMasters = require('../models/ProductCategoryMaster')(
            sequelizeInstance, DataTypes
        )
        const ExProductCategoryMaster = await ProductCategoryMasters.findAll(); // Find the record by its primary key

        if (ExProductCategoryMaster) {
            logger.info('Successfully Get All ProductCategoryMaster')
            res.status(200).json(ExProductCategoryMaster); // Return the found record
        } else {
            res.status(404).json({ error: "ExProductCategoryMaster not found" }); // Return a 404 error if not found
        }
    } catch (error) {
        logger.error(`error while getting all ProductCategoryMaster`)
        console.error(error);
        res
            .status(500)
            .json({ error: "An error occurred while retrieving the news notice" }); // Handle any other errors
    }
});


/**
 * @swagger
 * /productCategoryMaster/update/{Id}:
 *   put:
 *     summary: Update a product category by ID
 *     tags: [ProductCategoryMaster]
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product category to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               CategoryName:
 *                 type: string
 *                 description: The updated name of the product category.
 *               URL:
 *                 type: string
 *                 description: The updated URL path of the product category.
 *               Priority:
 *                 type: integer
 *                 description: The updated priority of the product category.
 *               ShowOnCategory:
 *                 type: boolean
 *                 description: Whether to display the product category on the category page.
 *               ShowCategoryList:
 *                 type: boolean
 *                 description: Whether to include the product category in the category list.
 *               Status:
 *                 type: boolean
 *                 description: The updated status of the product category.
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Optional new image file for the product category.
 *     responses:
 *       200:
 *         description: Successfully updated the product category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductCategoryMaster'
 *       404:
 *         description: Product category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product category not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */


router.put("/update/:Id",authenticateJWT, upload.single("Image"), async (req, res) => {
    const { Id } = req.params;
    const { CategoryName, URL, Priority, ShowOnCategory, ShowCategoryList, Status, Description } = req.body;
    const Image = req.file;
    let imagePath = null;

    if (Image) {
        imagePath = `${req.protocol}://${req.get("host")}/uploads/${Image.filename}`;
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
        const ProductCategoryMasters = require('../models/ProductCategoryMaster')(
            sequelizeInstance, DataTypes
        )

        const existingProductCategoryMaster = await ProductCategoryMasters.findByPk(Id);

        if (existingProductCategoryMaster) {
            // Delete the existing image if a new image is uploaded
            if (Image && existingProductCategoryMaster.Imagepaths) {
                const existingImagePath = existingProductCategoryMaster.Imagepaths.replace(
                    `${req.protocol}://${req.get("host")}`,
                    './',
                );
                fs.unlinkSync(existingImagePath);
                existingProductCategoryMaster.Imagepaths = null;
            }

            // Update product category properties
            existingProductCategoryMaster.CategoryName = CategoryName;
            existingProductCategoryMaster.URL = URL;
            existingProductCategoryMaster.Imagepaths = imagePath || existingProductCategoryMaster.Imagepaths;
            existingProductCategoryMaster.Priority = Priority;
            existingProductCategoryMaster.ShowOnCategory = ShowOnCategory;
            existingProductCategoryMaster.ShowCategoryList = ShowCategoryList;
            existingProductCategoryMaster.Status = Status;
            existingProductCategoryMaster.Description = Description;

            // Save the updated record
            await existingProductCategoryMaster.save();

            logger.info('Successfully updated ProductCategoryMaster')
            res.status(200).json(existingProductCategoryMaster);
        } else {
            res.status(404).json({ error: "Product category not found" });
        }
    } catch (error) {
        console.error(error);
        logger.error(`Error while updating ProductCategoryMaster with id: ${Id}`)
        res.status(500).json({ error: "An error occurred while updating the product category" });
    }
});


/**
 * @swagger
 * /productCategoryMaster/delete/{id}:
 *   delete:
 *     summary: Delete a Product Category Master by ID
 *     tags: [ProductCategoryMaster]
 *     description: Delete a Product Category Master by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the Product Category Master to delete
 *     responses:
 *       '200':
 *         description: Product Category Master deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ProductCategoryMaster with id 123 deleted successfully
 *       '404':
 *         description: Product Category Master not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ProductCategoryMaster with id 123 not found
 *       '500':
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
router.delete("/delete/:id",authenticateJWT, async (req, res) => {
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
        const ProductCategoryMasters = require('../models/ProductCategoryMaster')(
            sequelizeInstance, DataTypes
        )

        // Assuming mdl.db.ProductCategoryMaster is your model
        const deletedProductCategory = await ProductCategoryMasters.destroy({
            where: { id: id }
        });

        if (deletedProductCategory === 1) {
            logger.info(`ProductCategoryMaster ID:${id} delete successfully`)
            res.status(200).json({
                message: `ProductCategoryMaster with id ${id} deleted successfully`,
            });
        } else {
            res.status(404).json({
                error: `ProductCategoryMaster with id ${id} not found`,
            });
        }
    } catch (error) {
        console.error(error);
        logger.error(`Error while deleting ProductCategoryMaster with id: ${id}`)
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;