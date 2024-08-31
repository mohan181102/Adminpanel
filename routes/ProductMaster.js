
const express = require('express');
const router = express.Router();

const mdl = require("../models");
const path = require("path");
const fs = require("fs");

const upload = require("../utils/upload");
const getDbconnection = require('../DbConnection/CdConnection');
const { DataTypes } = require('sequelize');
const logger = require('../utils/logger');
const authenticateJWT = require('../utils/JWTauth');


const uploadFields = [
  { name: 'Image1', maxCount: 1 },
  { name: 'Image2', maxCount: 1 },
  { name: 'Image3', maxCount: 1 },
  { name: 'Image4', maxCount: 1 },
  { name: 'Image5', maxCount: 1 },
  { name: 'Image6', maxCount: 1 },
  { name: 'Image7', maxCount: 1 },
  { name: 'Image8', maxCount: 1 },
  { name: 'Image9', maxCount: 1 },
  // Add more fields as needed
];


/**
 * @swagger
 * /ProductMaster/create:
 *   post:
 *     summary: Create a new Product Master
 *     description: Endpoint to create a new Product Master with images.
 *     tags:
 *       - Product Master
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Category:
 *                 type: string
 *                 description: Category of the product.
 *                 example: "Electronics"
 *               ProductName:
 *                 type: string
 *                 description: Name of the product.
 *                 example: "Smartphone X"
 *               URL:
 *                 type: string
 *                 description: URL related to the product.
 *                 example: "https://example.com/products/smartphone-x"
 *               Priority:
 *                 type: integer
 *                 description: Priority of the product.
 *                 example: 1
 *               Status:
 *                 type: boolean
 *                 description: Status of the product.
 *                 example: "Active"
 *               Price:
 *                 type: number
 *                 description: Price of the product.
 *                 example: 999.99
 *               Details2:
 *                 type: string
 *                 description: Additional details field 2.
 *                 example: "Battery life: 24 hours"
 *               Details3:
 *                 type: string
 *                 description: Additional details field 3.
 *                 example: "Color: Black"
 *               Details4:
 *                 type: string
 *                 description: Additional details field 4.
 *                 example: "Warranty: 1 year"
 *               Details5:
 *                 type: string
 *                 description: Additional details field 5.
 *                 example: "Dimensions: 6.2 x 3.0 x 0.3 inches"
 *               Description:
 *                 type: string
 *                 description: The Description of the product category.
 *                 example: <>
 *               Image1:
 *                 type: string
 *                 format: binary
 *                 description: Image file 1 for the product.
 *                 example: "binary_data"
 *               Image2:
 *                 type: string
 *                 format: binary
 *                 description: Image file 2 for the product.
 *                 example: "binary_data"
 *               Image3:
 *                 type: string
 *                 format: binary
 *                 description: Image file 3 for the product.
 *                 example: "binary_data"
 *               Image4:
 *                 type: string
 *                 format: binary
 *                 description: Image file 4 for the product.
 *                 example: "binary_data"
 *               Image5:
 *                 type: string
 *                 format: binary
 *                 description: Image file 5 for the product.
 *                 example: "binary_data"
 *               Image6:
 *                 type: string
 *                 format: binary
 *                 description: Image file 6 for the product.
 *                 example: "binary_data"
 *               Image7:
 *                 type: string
 *                 format: binary
 *                 description: Image file 7 for the product.
 *                 example: "binary_data"
 *               Image8:
 *                 type: string
 *                 format: binary
 *                 description: Image file 8 for the product.
 *                 example: "binary_data"
 *               Image9:
 *                 type: string
 *                 format: binary
 *                 description: Image file 9 for the product.
 *                 example: "binary_data"
 *     responses:
 *       '201':
 *         description: Product Master created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product Master created successfully"
 *                 ProductMaster:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60be5d35f57b5e0015f3ad62"
 *                     Category:
 *                       type: string
 *                       example: "Electronics"
 *                     ProductName:
 *                       type: string
 *                       example: "Smartphone X"
 *                     URL:
 *                       type: string
 *                       example: "https://example.com/products/smartphone-x"
 *                     Priority:
 *                       type: integer
 *                       example: 1
 *                     Status:
 *                       type: string
 *                       example: "true"
 *                     Price:
 *                       type: number
 *                       example: 999.99
 *                     Details2:
 *                       type: string
 *                       example: "Battery life: 24 hours"
 *                     Details3:
 *                       type: string
 *                       example: "Color: Black"
 *                     Details4:
 *                       type: string
 *                       example: "Warranty: 1 year"
 *                     Details5:
 *                       type: string
 *                       example: "Dimensions: 6.2 x 3.0 x 0.3 inches"
 *                     Description:
 *                       type: string
 *                       description: The Description of the product category.
 *                       example: <>
 *                     Image1Url:
 *                       type: string
 *                       example: "https://example.com/uploads/image1.png"
 *                     Image2Url:
 *                       type: string
 *                       example: "https://example.com/uploads/image2.png"
 *                     Image3Url:
 *                       type: string
 *                       example: "https://example.com/uploads/image3.png"
 *                     Image4Url:
 *                       type: string
 *                       example: "https://example.com/uploads/image4.png"
 *                     Image5Url:
 *                       type: string
 *                       example: "https://example.com/uploads/image5.png"
 *                     Image6Url:
 *                       type: string
 *                       example: "https://example.com/uploads/image6.png"
 *                     Image7Url:
 *                       type: string
 *                       example: "https://example.com/uploads/image7.png"
 *                     Image8Url:
 *                       type: string
 *                       example: "https://example.com/uploads/image8.png"
 *                     Image9Url:
 *                       type: string
 *                       example: "https://example.com/uploads/image9.png"
 *       '500':
 *         description: Server error
 */

//   router.post('/create', upload.fields(uploadFields), async (req, res) => {
//     const {
//       Category, ProductName, URL, Priority, Status, Price, Details2, Details3, Details4,
//       Details5 } = req.body;

//     try {
//       // Example: handle SelectLogo upload if present
//       let Image1Url = null;
//       if (req.files['Image1']) {
//         const Image1File = req.files['Image1'][0];
//         Image1Url = `${req.protocol}://${req.get("host")}/uploads/${Image1File.filename}`;
//       }

//       let Image2Url = null;
//       if (req.files['Image2']) {
//         const Image2File = req.files['Image2'][0];
//         Image2Url = `${req.protocol}://${req.get("host")}/uploads/${Image2File.filename}`;
//       }

//       let Image3Url = null;
//       if (req.files['Image3']) {
//         const Image3File = req.files['Image3'][0];
//         Image3Url = `${req.protocol}://${req.get("host")}/uploads/${Image3File.filename}`;
//       }

//       let Image4Url = null;
//       if (req.files['Image4']) {
//         const Image4File = req.files['Image4'][0];
//         Image4Url = `${req.protocol}://${req.get("host")}/uploads/${Image4File.filename}`;
//       }

//       let Image5Url = null;
//       if (req.files['Image5']) {
//         const Image5File = req.files['Image5'][0];
//         Image5Url = `${req.protocol}://${req.get("host")}/uploads/${Image5File.filename}`;
//       }

//       let Image6Url = null;
//       if (req.files['Image6']) {
//         const Image6File = req.files['Image6'][0];
//         Image6Url = `${req.protocol}://${req.get("host")}/uploads/${Image6File.filename}`;
//       }

//       let Image7Url = null;
//       if (req.files['Image7']) {
//         const Image7File = req.files['Image7'][0];
//         Image7Url = `${req.protocol}://${req.get("host")}/uploads/${Image7File.filename}`;
//       }

//       let Image8Url = null;
//       if (req.files['Image8']) {
//         const Image8File = req.files['Image8'][0];
//         Image8Url = `${req.protocol}://${req.get("host")}/uploads/${Image8File.filename}`;
//       }

//       let Image9Url = null;
//       if (req.files['Image9']) {
//         const Image9File = req.files['Image9'][0];
//         Image9Url = `${req.protocol}://${req.get("host")}/uploads/${Image9File.filename}`;
//       }

//       // Create a new ProductMaster object
//       const newProductMaster = await mdl.db.ProductMaster.create({
//         Category: Category,
//         ProductName: ProductName,
//         URL: URL,
//         Priority: Priority,
//         Status: Status,
//         Price: Price,
//         Details2: Details2,
//         Details3: Details3,
//         Details4: Details4,
//         Details5: Details5,
//         Image1: Image1Url,
//         Image2: Image2Url,
//         Image3: Image3Url,
//         Image4: Image4Url,
//         Image5: Image5Url,
//         Image6: Image6Url,
//         Image7: Image7Url,
//         Image8: Image8Url,
//         Image9: Image9Url,
//       });

//       res.status(201).json({
//         message: "ProductMaster created successfully",
//         ProductMaster: newProductMaster
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });

router.post('/create', authenticateJWT, upload.fields(uploadFields), async (req, res) => {
  const {
    Category, ProductName, URL, Priority, Status, Price, Details2, Details3, Details4,
    Details5, Description
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
    const ProductMaster = require('../models/ProductMaster')(
      sequelizeInstance, DataTypes
    )


    const imageUrls = {};

    // Loop through Image1 to Image9
    for (let i = 1; i <= 9; i++) {
      const fieldName = `Image${i}`;
      if (req.files[fieldName]) {
        const file = req.files[fieldName][0];
        imageUrls[fieldName] = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      }
    }

    // Create a new ProductMaster object
    const newProductMaster = await ProductMaster.create({
      Category: Category,
      ProductName: ProductName,
      URL: URL,
      Priority: Priority,
      Status: Status,
      Price: Price,
      Details2: Details2,
      Details3: Details3,
      Details4: Details4,
      Details5: Details5,
      Description: Description,
      ...imageUrls
    });

    logger.info("Product Master create successsful")
    res.status(201).json({
      message: "ProductMaster created successfully",
      ProductMaster: newProductMaster
    });
  } catch (err) {
    console.error(err);
    logger.error(`Product Master failed ERROR:${err}`)
    res.status(500).json({ message: 'Server error' });
  }
});



/**
 * @swagger
 * /ProductMaster/{id}:
 *   get:
 *     summary: Retrieve a product by ID
 *     description: Retrieve a product from the database by its ID.
 *     tags:
 *       - Product Master
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product to retrieve
 *     responses:
 *       '200':
 *         description: A single product object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Product Name"
 *                 price:
 *                   type: number
 *                   example: 29.99
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               error: ProductMaster not found
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
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
    const ProductMasters = require('../models/ProductMaster')(
      sequelizeInstance, DataTypes
    )

    const ProductMaster = await ProductMasters.findByPk(id);
    if (ProductMaster) {
      logger.info(`Product MAsters get successfully ${id}`)
      res.status(200).json(ProductMaster); // Return the found record
    } else {
      res.status(404).json({ error: "ProductMaster not found" }); // Return a 404 error if not found
    }
  } catch (err) {
    console.error(err);
    logger.error(`Product MAsters get failed ERROR:${err}`)
    res.status(500).json({ message: 'Server error' });
  }
});



/**
 * @swagger
 * /ProductMaster/get/all:
 *   get:
 *     summary: Retrieve a product by ID
 *     description: Retrieve a product from the database by its ID.
 *     tags:
 *       - Product Master
 *     responses:
 *       '200':
 *         description: A single product object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Product Name"
 *                 price:
 *                   type: number
 *                   example: 29.99
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               error: ProductMaster not found
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
 */

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
    const ProductMaster = require('../models/ProductMaster')(
      sequelizeInstance, DataTypes
    )
    const ExProductMaster = await ProductMaster.findAll();
    if (ExProductMaster) {
      logger.info(`ProductMaster get successfully`)
      res.status(200).json(ExProductMaster); // Return the found record
    } else {
      logger.error(`ProductMaster get failed`)
      res.status(404).json({ error: "ExProductMaster not found" }); // Return a 404 error if not found
    }
  } catch (err) {
    console.error(err);
    logger.error(`ProductMaster get failed ERROR:${err}`)
    res.status(500).json({ message: 'Server error' });
  }
});


/**
* @swagger
* /ProductMaster/update/{id}:
*   put:
*     summary: Update a ProductMaster
*     description: Update an existing ProductMaster object by ID
*     tags:
*       - Product Master
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*         description: ID of the ProductMaster to update
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             type: object
*             properties:
*               Category:
*                 type: string
*                 description: Category of the product.
*                 example: "Electronics"
*               ProductName:
*                 type: string
*                 description: Name of the product.
*                 example: "Smartphone X"
*               URL:
*                 type: string
*                 description: URL related to the product.
*                 example: "https://example.com/products/smartphone-x"
*               Priority:
*                 type: integer
*                 description: Priority of the product.
*                 example: 1
*               Status:
*                 type: boolean
*                 description: Status of the product.
*                 example: "Active"
*               Price:
*                 type: number
*                 description: Price of the product.
*                 example: 999.99
*               Details2:
*                 type: string
*                 description: Additional details field 2.
*                 example: "Battery life: 24 hours"
*               Details3:
*                 type: string
*                 description: Additional details field 3.
*                 example: "Color: Black"
*               Details4:
*                 type: string
*                 description: Additional details field 4.
*                 example: "Warranty: 1 year"
*               Details5:
*                 type: string
*                 description: Additional details field 5.
*                 example: "Dimensions: 6.2 x 3.0 x 0.3 inches"
*               Description:
*                 type: string
*                 description: The Description of the product category.
*                 example: <>
*               Image1:
*                 type: string
*                 format: binary
*                 description: Image file 1 for the product.
*                 example: "binary_data"
*               Image2:
*                 type: string
*                 format: binary
*                 description: Image file 2 for the product.
*                 example: "binary_data"
*               Image3:
*                 type: string
*                 format: binary
*                 description: Image file 3 for the product.
*                 example: "binary_data"
*               Image4:
*                 type: string
*                 format: binary
*                 description: Image file 4 for the product.
*                 example: "binary_data"
*               Image5:
*                 type: string
*                 format: binary
*                 description: Image file 5 for the product.
*                 example: "binary_data"
*               Image6:
*                 type: string
*                 format: binary
*                 description: Image file 6 for the product.
*                 example: "binary_data"
*               Image7:
*                 type: string
*                 format: binary
*                 description: Image file 7 for the product.
*                 example: "binary_data"
*               Image8:
*                 type: string
*                 format: binary
*                 description: Image file 8 for the product.
*                 example: "binary_data"
*               Image9:
*                 type: string
*                 format: binary
*                 description: Image file 9 for the product.
*                 example: "binary_data"
*     responses:
*       '200':
*         description: Successfully updated ProductMaster
*       '400':
*         description: Invalid request
*       '404':
*         description: ProductMaster not found
*       '500':
*         description: Server error
*/


router.put('/update/:id', authenticateJWT, upload.fields(uploadFields), async (req, res) => {
  const productId = req.params.id;
  const {
    Category, ProductName, URL, Priority, Status, Price, Details2, Details3, Details4,
    Details5, Description
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
    const ProductMasters = require('../models/ProductMaster')(
      sequelizeInstance, DataTypes
    )

    // Example: handle SelectLogo upload if present
    const imageUrls = {};

    // Loop through Image1 to Image9
    for (let i = 1; i <= 9; i++) {
      const fieldName = `Image${i}`;
      if (req.files[fieldName]) {
        const file = req.files[fieldName][0];
        imageUrls[fieldName] = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      }
    }

    // Find the existing product by ID
    let existingProduct = await ProductMasters.findByPk(productId);

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Function to delete file from file system
    const deleteFile = (filePath) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        } else {
          console.log(`Deleted file: ${filePath}`);
        }
      });
    };

    // Update the existing product fields
    existingProduct.Category = Category;
    existingProduct.ProductName = ProductName;
    existingProduct.URL = URL;
    existingProduct.Priority = Priority;
    existingProduct.Status = Status;
    existingProduct.Price = Price;
    existingProduct.Details2 = Details2;
    existingProduct.Details3 = Details3;
    existingProduct.Details4 = Details4;
    existingProduct.Details5 = Details5;
    existingProduct.Description = Description;

    // Update image URLs and delete old files if they were provided in the request
    for (let i = 1; i <= 9; i++) {
      const fieldName = `Image${i}`;
      if (req.files[fieldName]) {
        // Delete existing image if it exists
        if (existingProduct[fieldName]) {
          const filePath = path.join(__dirname, './uploads', path.basename(existingProduct[fieldName]));
          deleteFile(filePath);
        }
        // Update image URL in the product
        existingProduct[fieldName] = imageUrls[fieldName];
      }
    }

    // Save the updated product
    await existingProduct.save();

    logger.info(`Update Product Master successfully`)
    res.status(200).json({
      message: "ProductMaster updated successfully",
      ProductMaster: existingProduct
    });
  } catch (err) {
    console.error(err);
    logger.error(`Error updating Product Master: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * @swagger
 * /ProductMaster/{productId}:
 *   delete:
 *     summary: Delete a product by its ID
 *     tags:
 *       - Product Master
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product 1 deleted successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */


// DELETE endpoint to delete a product by its ID
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
    const ProductMasters = require('../models/ProductMaster')(
      sequelizeInstance, DataTypes
    )

    // Check if product exists
    const product = await ProductMasters.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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

    logger.info(`Product Master ${productId} deleted successfully`)
    res.json({
      message: `Product ${productId} deleted successfully`
    });
  } catch (err) {
    console.error(err);
    logger.error(`Error deleting Product Master ${productId}: ${err.message}`);
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
 * /ProductMaster/{productId}/images/{imageId}:
 *   delete:
 *     summary: Delete a specific image of a product by its ID
 *     tags:
 *       - Product Master
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product
 *       - name: imageId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the image to delete (e.g., 1 for Image1, 2 for Image2, etc.)
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
 *                   example: Image 1 deleted successfully for product 8
 *                 updatedProduct:
 *                   $ref: '#/components/schemas/ProductMaster'
 *       404:
 *         description: Product or image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */

router.delete('/:productId/images/:imageId', authenticateJWT, async (req, res) => {
  const { productId, imageId } = req.params;

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
    const ProductMasters = require('../models/ProductMaster')(
      sequelizeInstance, DataTypes
    )

    // Check if product exists
    const product = await ProductMasters.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Construct image field name based on imageId (e.g., Image1, Image2, etc.)
    const fieldName = `Image${imageId}`;

    // Check if the image field exists in the product
    if (!product[fieldName]) {
      return res.status(404).json({ message: 'Image not found for the product' });
    }

    // Delete the image file
    const filePath = path.join(__dirname, '../uploads', path.basename(product[fieldName]));
    deleteFile(filePath);

    // Update the product to nullify the image field
    product[fieldName] = null;
    const updatedProduct = await product.save();

    logger.info(`Product Master Update successfully`)
    res.json({
      message: `Image ${imageId} deleted successfully for product ${productId}`,
      updatedProduct
    });
  } catch (err) {
    console.error(err);
    logger.error(`Error deleting image ${imageId} for Product Master ${productId}: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;