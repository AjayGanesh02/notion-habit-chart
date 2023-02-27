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
        console.log(error.body);
    }
}

// This function is used to access up to 50 child blocks per page given the page ID
async function getChildBlocks(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 50,
        });
        return response.results;
    } catch (error) {
        console.log(error.body);
    }
}

// This function will access the data from the given database, generate a chart with QuickChart,
// and return the QuickChart URL containing the chart image 
async function getChart(databaseId, chartType) {

    // const data = await queryDatabase(databaseId)
    //     .then(async results => {
    //         const dataPts = [];
    //         const labels = [];

    //         for (i = 0; i < results.length; i++) {
    //             const pageId = results[i].id;
    //             const nameId = results[i].properties.Name.id;
    //             const scoreId = results[i].properties.Score.id;

    //             try {
    //                 const nameVal = await notion.pages.properties.retrieve({ page_id: pageId, property_id: nameId });
    //                 const scoreVal = await notion.pages.properties.retrieve({ page_id: pageId, property_id: scoreId });
    //                 labels.push(nameVal.results[0].title.text.content);
    //                 dataPts.push(scoreVal.number);

    //             } catch (error) {
    //                 console.log(error.body);
    //             }
    //         }
    //         return { "Labels": labels, "Data Points": dataPts };
    //     });

    const results = await queryDatabase(databaseId)

    for (i = 0; i < results.length; i++) {
        const pageId = results[i].id;
        // const nameId = results[i].properties.Name.id;
        // const scoreId = results[i].properties.Score.id;

        try {
            // const nameVal = await notion.pages.properties.retrieve({ page_id: pageId, property_id: nameId });
            // const scoreVal = await notion.pages.properties.retrieve({ page_id: pageId, property_id: scoreId });
            // labels.push(nameVal.results[0].title.text.content);
            // dataPts.push(scoreVal.number);
            console.log(results[i].properties)

        } catch (error) {
            console.log(error.body);
        }
    }
    // console.log(data)

    // const myChart = new QuickChart();
    // myChart.setConfig({
    //     type: chartType,
    //     data: {
    //         labels: data["Labels"],
    //         datasets: [{ label: 'Scores', data: data["Data Points"] }]
    //     },
    // })
    //     .setWidth(800)
    //     .setHeight(400)
    //     .setBackgroundColor('transparent');

    // the chart URL
    //console.log(myChart.getUrl());
    // return myChart.getUrl();
}

getChart(databaseId, 'line');
