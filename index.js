// Import the Express library
const express = require("express");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/index");
const ClientDatabase = require("./config/ClientDBindex")
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const cookieParser = require("cookie-parser")
const PORT = 3000


// Create an Express application
const app = express();
app.use(cookieParser());

app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use(express.json());

// app.use(express.static(path.join(__dirname, 'public')));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.urlencoded({ extended: true }));


// Define a route to handle GET requests to the root URL
app.get("/", async (req, res) => {
  res.send("Hello, this is a GET request!");
});

// cross origin setup
app.use(
  cors({
    origin: ["https://tc2.yes-bm.com", "http://localhost:3001"], // Adjust this to match your frontend's origin
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// AUTHENTICATION
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization

  console.log("Auth token: " + token)
  if (!token) {
    return res.status(401).json({ message: 'Authentication token not found' });
  }
  next();
};

//to create the database
app.get("/createdatabase", (req, res) => {
  const db = require("./models");
  db.sync_models();
  res.send("Database Created");
});


//routes
const Gallery = require("./routes/gallery");
app.use("/gallery", Gallery);

const Slider = require("./routes/slider");
app.use("/api", Slider);

const MenuMaster = require("./routes/MenuMaster")
app.use("/MenuMaster", MenuMaster)

const NewsNotice = require("./routes/newsnotice")
app.use("/newsnotices", NewsNotice)

const FlashNews = require("./routes/flashnews")
app.use("/flashnews", FlashNews)

const GeneralSetting = require("./routes/GeneralSetting")
app.use("/GeneralSetting", GeneralSetting)

const ProductCategoryMaster = require("./routes/ProductCategoryMaster")
app.use("/ProductCategoryMaster", ProductCategoryMaster)

const ProductMaster = require("./routes/ProductMaster")
app.use("/ProductMaster", ProductMaster)

const AdvertisementMaster = require("./routes/AdvertisementMaster")
app.use("/AdvertisementMaster", AdvertisementMaster)

const Event = require("./routes/Event")
app.use("/Event", Event)

const Download = require("./routes/Download")
app.use("/Download", Download)

const Testimonial = require("./routes/Testimonial")
app.use("/Testimonial", Testimonial)

const VideoMaster = require("./routes/VideoMaster")
app.use("/VideoMaster", VideoMaster)

const HPBodyCard = require("./routes/HPBodyCard")
app.use("/HPBodyCard", HPBodyCard)

const HPContentMaster = require("./routes/HPContentMaster")
app.use("/HPContentMaster", HPContentMaster)

const TCissued = require("./routes/TCissued")
app.use("/TCissued", TCissued)

const Contact = require("./routes/Contact")
app.use("/Contact", Contact)

const Result = require("./routes/Result")
app.use("/Result", Result)

const User = require("./routes/Authentication")
app.use("/User", User)

const PriceMaster = require("./routes/PriceMasterRoute")
app.use("/pricemaster", PriceMaster)

const Client = require('./routes/ClientRoute')
app.use("/client", Client)

const PageViewMaster = require("./routes/PageViewMaster")
app.use("/pageview", PageViewMaster)

const Academicmaster = require("./routes/AcademicMaster")
app.use("/academicmaster", Academicmaster)

const CourseMaster = require("./routes/CourseMasterRoute")
app.use("/coursemaster", CourseMaster)

const Footer = require("./routes/FooterRoute")
app.use("/Footer", Footer)

const FontAwesome = require("./routes/FontAwesome")
app.use("/fontawesome", FontAwesome)

const DashboardPage = require("./routes/DashboardPage")
app.use("/dashboardpage", DashboardPage)

const FrontEndPage = require("./routes/FrontEndPage")
app.use("/frontendpage", FrontEndPage)

const DashboardCard = require("./routes/DashboardCard")
app.use("/dashboardcard", DashboardCard)

const HeaderTopMaster = require("./routes/HeaderTopMaster")
app.use("/headertopmaster", HeaderTopMaster)

const BlackList = require("./routes/Blacklisted.Route")
app.use("/blacklistToken", BlackList)


const ClientDetails = require("./routes/ClientDetailsRoute");
const { default: isJWT } = require("./utils/CheckJWTToken");
app.use("/ClientDetails", ClientDetails)

// Start the server and listen on port 3000
// sequelize.sync().then(() => {
//   app.listen(3000, async () => {
//     try {
//       await sequelize.authenticate();
//       await ClientDatabase.authenticate()
//       console.log("Connection has been established successfully.");
//     } catch (error) {
//       console.error("Unable to connect to the database:", error);
//     }
//     console.log("Server is running on port 3000");
//   });
// });

async function startServer() {
  try {
    // Synchronize Sequelize models with the database
    await sequelize.sync();
    await ClientDatabase.sync();

    // Test database connections
    await sequelize.authenticate();
    await ClientDatabase.authenticate(); // Ensure this is defined and properly connected

    // Start Express server
    app.listen(PORT, () => {
      console.log("Connection has been established successfully.");
      console.log("Server is running on port " + PORT);
    });

  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1); // Exit the process with failure code
  }
}

startServer() 