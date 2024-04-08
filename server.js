const express = require("express");
const mongoose = require("mongoose");
const app = express();
const fs = require("fs");
const path = require("path");
const port = Number(process.env.PORT) || 3000;
const cors = require('cors');

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());


function loadRoutes(app) {
    const modulesPath = path.join(__dirname, 'app/routes');
    const moduleDirectories = fs.readdirSync(modulesPath);

    moduleDirectories.forEach(moduleName => {
        const moduleRoutesPath = path.join(modulesPath, moduleName, `${moduleName}.js`);
        if (fs.existsSync(moduleRoutesPath)) {
            const routes = require(moduleRoutesPath);
            app.use(`/${moduleName}`, routes); // Mount routes with module prefix
            console.log(`Routes loaded for module: ${moduleName}`);
        }
    });
}

// Load routes from the routes directory
loadRoutes(app);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the Express server after MongoDB connection is established
        app.listen(port, () => {
            console.log(`Server is listening at http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });


//TODO close mongo connection