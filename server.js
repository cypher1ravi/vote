const express = require('express');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;

// Create connection to MySQL database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'voting_data'
});

// Connect to MySQL database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware to parse JSON bodies
app.use(express.json());
app.post('/submit', (req, res) => {
    const { employeeName, employeeId, products } = req.body;

    // Insert data into MySQL database
    const query = 'INSERT INTO employeeVote (employee_name, employee_id, products) VALUES (?, ?, ?)';
    connection.query(query, [employeeName, employeeId, products.join(',')], (error, results, fields) => {
        if (error) {
            console.error('Error inserting data: ', error);
            res.status(500).json({ error: 'Error inserting data into database' });
            console.log(error);
            return;
        }
        console.log('Data inserted successfully');
        // res.redirect('/resultPage')
        res.status(200).json({ message: 'Data inserted successfully' });
    });
});
// Route to get the result
app.get('/result', (req, res) => {
    // Query to get all rows from the database
    const query = 'SELECT products FROM employeeVote';

    // Execute the query
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error('Error fetching result: ', error);
            res.status(500).json({ error: 'Error fetching result from database' });
            return;
        }

        // Initialize an object to store counts for each product
        const productCounts = {};

        // Initialize total voter count
        let totalVoterCount = 0;

        // Iterate through each row
        results.forEach(row => {
            // Split the products by comma
            const products = row.products.split(',');

            // Increment total voter count
            totalVoterCount++;

            // Count each product
            products.forEach(product => {
                // If the product exists in the counts object, increment its count, otherwise initialize it to 1
                productCounts[product] = (productCounts[product] || 0) + 1;
            });
        });

        // Prepare response data
        const result = Object.entries(productCounts).map(([product, count]) => ({ product, count }));

        // Send the result along with the total voter count as JSON
        res.status(200).json({ result, totalVoterCount });
    });
});



app.use(express.static(path.join(__dirname, '/public')));
// Route to serve the index.html file from the same directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/resultPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'result.html'));

});
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
