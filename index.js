// Importing all necessary dependencies
const QuickChart = require('quickchart-js');
const dotenv = require('dotenv');
const { Client } = require('@notionhq/client');
const axios = require('axios');
dotenv.config();

// Creating global variables that store our API credentials and other necessary information
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;
const pageId = process.env.NOTION_PAGE_ID;
const clientId = process.env.IMGUR_CLIENT_ID;

// This function is used to access the data from a Notion database given the database ID
async function queryDatabase(databaseId) {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
        });
        return response.results;
    } catch (error) {
        console.error(error.body);
    }
}

// This function will access the data from the given database, generate a chart with QuickChart,
// and return the QuickChart URL containing the chart image 
async function getChart(databaseId, chartType) {

    const results = await queryDatabase(databaseId)
    const labels = Array(31).fill('');
    const dataPts = Array(31).fill(0);

    for (i = 0; i < results.length; i++) {
        const curResultProp = results[i].properties;
        const dayIdx = parseInt(curResultProp.Day.title[0].plain_text) - 1
        labels[dayIdx] = curResultProp.Day.title[0].plain_text
        dataPts[dayIdx] = curResultProp.Progress.formula.number / (Object.keys(curResultProp).length - 2)
    }

    const myChart = new QuickChart();
    myChart.setConfig({
        type: chartType,
        data: {
            labels: labels,
            datasets: [{ label: 'Scores', data: dataPts }]
        },
    })
        .setWidth(800)
        .setHeight(400)
        .setBackgroundColor('transparent');

    // the chart URL
    return myChart.getUrl();
}

async function getImgurURL(clientId, chartlink) {

    const imgurLink = await axios
        .post('https://api.imgur.com/3/image', chartlink, {
            headers: {
                Accept: "application/json",
                Authorization: `Client-ID ${clientId}`,
            },
        })
        .then(({ data }) => {
            return data.data.link;
        });

    return imgurLink;
}

async function updateImageBlock(pageId, newLink) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });

        const childBlocks = response.results
        let imageBlockId = '';
        for (j = 0; j < childBlocks.length; ++j) {
            if (childBlocks[j].type === 'image') {
                imageBlockId = childBlocks[j].id;
                break;
            }
        }
        if (imageBlockId === '') {
            console.error("No Image Block found")
            return;
        }

        const updateResponse = await notion.blocks.update({
            block_id: imageBlockId,
            "image": {
                "external": {
                    "url": newLink
                }
            }
        })

        return updateResponse;
    } catch (error) {
        console.error(error);
    }
}

async function updateChart(database_id, page_id, client_id) { 
    const chartURL = await getChart(database_id, 'line');
    console.log(`chart URL: ${chartURL}`)

    const imgurURL = await getImgurURL(client_id, chartURL);
    console.log(`imgur URL: ${imgurURL}`)

    const resp = await updateImageBlock(page_id, imgurURL);
}

updateChart(databaseId, pageId, clientId);