const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const hubspot = require('@hubspot/api-client');

const app = express();

app.set("view engine", "pug");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const accessToken = process.env.ACCESS_TOKEN;
const hubspotClient = new hubspot.Client({ accessToken: accessToken });

const objectType = "pokemons";
const limit = 100;
let after = undefined;
const pokemonProperties = ["nature", "type", "name"];
const propertiesWithHistory = undefined;
const associations = undefined;
const archived = false;

//function to create a new hubspot crm object (pokemon)
async function createPokemon (formData){

    //properties from POST
    const properties = {
        "name": formData.name,
        "type": formData.type,
        "nature": formData.nature
    };

    console.log("Posted properties are: ", properties);

    const SimplePublicObjectInputForCreate = { associations, properties};

    console.log("Creating Pokemon in Hubspot now!");

    try {
        const apiResponse = await hubspotClient.crm.objects.basicApi.create(objectType, SimplePublicObjectInputForCreate);
        console.log(JSON.stringify(apiResponse, null, 2));
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2))
            : console.error(e)
    }
}

app.get("/", async (req, res) => {

    const pageTitle = "Homepage";
    const tableName = "Pokemon Table"
    console.log("Reading your Pokemons");

    try {
        const pokemonResponse = await hubspotClient.crm.objects.basicApi.getPage(
            objectType,
            limit,
            after,
            pokemonProperties,
            propertiesWithHistory,
            associations,
            archived);
        console.log(JSON.stringify(pokemonResponse, null, 2));

        const pokemons = pokemonResponse.results;

        res.render('homepage', { pageTitle, tableName, pokemons });

    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2))
            : console.error(e)
    }
});

app.get("/update-cobj", async (req, res) => {
    const pageTitle = "Create a new Pokemon in Hubspot | Integrating With HubSpot | Practicum";
    res.render('updates', { pageTitle });
});

app.post("/update-cobj", async (req, res) => {
    await createPokemon(req.body);
    res.redirect('/');
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));