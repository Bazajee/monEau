// Import necessary modules
import { render } from 'ejs'; // Import render function from EJS
import express from 'express'; // Import Express.js
import path from 'path'; // Import path module for file paths
import axios from 'axios'; // Import Axios for making HTTP requests

// Create an Express application
const app = express();
const router = express.Router(); // Create an instance of Express Router

// Configure the view engine and views directory
app.set("view engine", "ejs");
app.set('views', path.join("static/", 'views'));

// Serve static files from the 'static' directory
app.use(express.static('static'));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Use the defined router for handling requests
app.use('/', router);

// Define routes

// Route for displaying sample view based on insee_code and indice
router.get("/sample_view/:insee_code/:indice", async function (request, response) {
    try {
        // Extract insee_code and indice from request parameters
        const insee_code = request.params.insee_code;
        const indice = request.params.indice;

        // Fetch data from an external API based on insee_code
        const urlApi_city = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/communes_udi?code_commune=${insee_code}%20&size=20`;
        const urlCity_result = (await axios.get(urlApi_city)).data;
        const year_list = urlCity_result.data;

        // Fetch sample data based on insee_code, indice, and year_list
        const first_date = `${year_list[indice].annee}-01-01`;
        const last_date = `${year_list[indice].annee}-12-31`;
        const urlApi_sample = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?code_commune=${insee_code}&code_reseau=${year_list[indice].code_reseau}&date_max_prelevement=${last_date}&date_min_prelevement=${first_date}&size=70&sort=asc`;
        const urlSample_result = (await axios.get(urlApi_sample)).data;
        const sample_list = urlSample_result.data;

        // Render the 'sample_view' template with retrieved data
        response.render("sample_view", { indice, year_list, sample_list });
    } catch (error) {
        // Handle errors if any occur
        console.error(error);
        response.status(500).send('Internal Server Error');
    }
});

// Route for displaying city view based on code
router.get ("/city_view/:code", async function (request, response){
    const insee_code = request.params.code;
    
    // Fetch data related to a city based on the code
    const urlApi_city = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/communes_udi?code_commune=${insee_code}%20&size=20`;
    const url_result = (await axios.get(urlApi_city)).data;
    const year_list = url_result.data;

    // Render the 'city_view' template with retrieved data
    response.render('city_view', { insee_code, year_list });
});

// Route for handling form submission to select a city
router.post("/select_city", async function (request, response) {
    const form_data = request.body.data_form;
    
    // Fetch list of zip objects based on form data
    const urlApi_list = `https://geo.api.gouv.fr/communes?codePostal=${form_data}`;
    const zip_objects  = (await axios.get(urlApi_list)).data;
    
    // Render the 'select_city' template with retrieved data
    response.render('select_city', { zip_objects, form_data });
});

// Route for the home page
app.get("/", function (request, response){
    // Render the 'home' template
    response.render('home');
});

// Start the server on port 3001
app.listen(3001, function() {
    console.log('listening to port 3001');
});