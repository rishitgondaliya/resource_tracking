const mongoose = require('mongoose');

// MongoDB URL
const url = 'mongodb://localhost:27017/register_student';

// Connect to MongoDB without deprecated options
mongoose.connect(url)
    .then(() => console.log('Connected successfully to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define a schema
const studentSchema = new mongoose.Schema({
    name: String,
    dk: Number
});

// Create a model with custom collection name
const collectionName = 'custom_collection_name'; // Specify your custom collection name here
const Student = mongoose.model('Student', studentSchema, collectionName);

// Insert a document
const newStudent = new Student({ name: 'hiten', dk: 100 });

newStudent.save()
    .then(result => {
        console.log(`Document inserted: ${result}`);
        // Close the connection after the operation is complete
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error saving data to MongoDB:', err);
        // Close the connection after the operation is complete
        mongoose.connection.close();
    });
