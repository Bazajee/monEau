import { render } from 'ejs';
import express, { response } from 'express';
import path from 'path';
import axios from 'axios';

const app = express();
const router = express.Router();


app.set("view engine", "ejs");

app.set('views', path.join("static/", 'views'));
app.use(express.static('static'));

app.use((express.urlencoded({extended:true})))

app.use('/', router)





router.get("/sample_view/:insee_code/:indice", async function (request, response) {

    try {    
        const insee_code = request.params.insee_code

        const urlApi_city = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/communes_udi?code_commune=${insee_code}%20&size=20`
        const urlCity_result = (await axios.get(urlApi_city)).data
        const year_list = urlCity_result.data
        

        const indice = request.params.indice

        const first_date = `${year_list[indice].annee}-01-01`
        const last_date = `${year_list[indice].annee}-12-31`    
        const urlApi_sample = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?code_commune=${insee_code}&code_reseau=${year_list[indice].code_reseau}&date_max_prelevement=${last_date}&date_min_prelevement=${first_date}&size=70&sort=asc`
        const urlSample_result = (await axios.get(urlApi_sample)).data
        const sample_list = urlSample_result.data

        response.render("sample_view", { indice, year_list, sample_list })
    } catch (error) {
        console.error(error);
        response.status(500).send('Internal Server Error');
    }
})

router.get ("/city_view/:code", async function (request, response){
    const insee_code = request.params.code
    
    const urlApi_city = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/communes_udi?code_commune=${insee_code}%20&size=20`
    const url_result = (await axios.get(urlApi_city)).data
    const year_list = url_result.data

    response.render('city_view', { insee_code, year_list })
})

router.post("/select_city", async function (request, response) {
    const form_data = request.body.data_form
    
    const urlApi_list = `https://geo.api.gouv.fr/communes?codePostal=${form_data}`
    const zip_objects  = (await axios.get(urlApi_list)).data
    
    response.render('select_city', { zip_objects, form_data })
})

app.get("/", function (request, response){
    response.render('home')
})


app.listen(3000, function() {
    console.log('listening to port 3000')
 })

