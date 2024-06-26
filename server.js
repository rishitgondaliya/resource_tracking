const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017/';
const dbName = 'register_student';

// Mongoose connection
mongoose.connect(url + dbName)
    .then(() => console.log('Connected successfully to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define a mongoose schema
const studentSchema = new mongoose.Schema({
    department: { type: String },
    semester: { type: String },
    enrollment: { type: Number, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
});

// Define a mongoose model based on the schema

app.use(bodyParser.json({ limit: '100mb' }));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/html', express.static(path.join(__dirname, 'html')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.post('/saveData', (req, res) => {
    const { department, semester, currentYear, students } = req.body;
    console.log('Received data:', req.body); // Debugging line
    const collectionName = `${department}_${semester}_${currentYear}`;
	const Student = mongoose.model('Student', studentSchema , collectionName);

                    Student.insertMany(students)
                    .then(result => {
                        console.log(`${result.insertedCount} documents inserted into collection ${collectionName}`);
                        res.send('Data saved successfully to MongoDB');
			})
        			.catch(err => {
           			 console.error('Error saving data to MongoDB:', err);
       				     res.status(500).send('Error saving data to MongoDB');
       			 });
    });

app.get('/students/:department/:semester/:year', async (req, res) => {
    const { department, semester, year } = req.params;
    const collectionName = `${department}_${semester}_${year}`;
    
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionExists = collections.some(collection => collection.name === collectionName);
        
        if (!collectionExists) {
            res.json({ message: 'Collection not found' });
	    console.log('data is not available');
            return;
        }
        else{
        const Student = mongoose.model(collectionName, studentSchema, collectionName);
        const students = await Student.find({});
        
        if (students.length === 0) {
            res.json({ message: 'Collection is available but no data found' });
		console.log('data is not available');

        } else {
            res.json(students);
        }
	}
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).send('Error fetching students');
    }
});

app.put('/students/:department/:semester/:year', async (req, res) => {
    const { department, semester, year } = req.params;
    const collectionName = `${department}_${semester}_${year}`;
    
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionExists = collections.some(collection => collection.name === collectionName);
        
        if (!collectionExists) {
            res.json({ message: 'Collection does not exist' });
            return;
        }
        
        const Student = mongoose.model(collectionName, studentSchema, collectionName);
        const students = req.body; // Updated students data from the client
        
        // Update each student in the database
        await Promise.all(students.map(async (updatedStudent) => {
            const { enrollment } = updatedStudent;
            await Student.updateOne({ enrollment: enrollment }, updatedStudent);
		console.log('student data updated');
        }));

        res.json({ message: 'Student data updated successfully' });
    } catch (error) {
        console.error('Error updating student data:', error);
        res.status(500).send('Error updating student data');
    }
});

app.delete('/students/:department/:semester/:year', async (req, res) => {
    try {
        const { department, semester, year } = req.params;
        const collectionName = `${department}_${semester}_${year}`;
        
        // Access the collection dynamically
        const collection = mongoose.connection.collection(collectionName);

        // Delete all documents in the collection
        await collection.deleteMany({});

        res.json({ message: 'All student data deleted successfully' });
    } catch (error) {
        console.error('Error deleting students:', error);
        res.status(500).send('Error deleting students');
    }
});

app.delete('/student/:department/:semester/:year/:enrollment', async (req, res) => {
    try {
        const { department, semester, year, enrollment } = req.params;
        const collectionName = `${department}_${semester}_${year}`;
        
        // Access the collection dynamically
        const collection = mongoose.connection.collection(collectionName);

        // Delete the specific document based on enrollment
        await collection.deleteOne({ enrollment: parseInt(enrollment, 10) });

        res.json({ message: 'Specific student data deleted successfully' });
    } catch (error) {
        console.error('Error deleting specific student:', error);
        res.status(500).send('Error deleting specific student');
    }
});

app.post('/shift-semester', async (req, res) => {
    try {
        const { department, semester, year, newSemester } = req.body;
        const oldCollectionName = `${department}_${semester}_${year}`;
        const newCollectionName = `${department}_${newSemester}_${year}`;
        
        const oldCollection = mongoose.connection.collection(oldCollectionName);
        const newCollection = mongoose.connection.collection(newCollectionName);
        
        const students = await oldCollection.find().toArray();

        const updatedStudents = students.map(student => ({
            ...student,
            semester: newSemester
        }));

        if (students.length > 0) {
            await newCollection.insertMany(updatedStudents);
            res.json({ message: `Students successfully shifted from ${oldCollectionName} to ${newCollectionName}` });
        } else {
            res.json({ message: `No students found in ${oldCollectionName}` });
        }
    } catch (error) {
        console.error('Error shifting semester:', error);
        res.status(500).send('Error shifting semester');
    }
});

app.get('/subjects/:department/:semester', async (req, res) => {
    try {
        const { department, semester } = req.params;
        const collectionName = `${department}_${semester}_subject`;
        console.log(`Fetching from collection: ${collectionName}`);
        
        const collection = mongoose.connection.db.collection(collectionName);
        // Ensure the collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionExists = collections.some(col => col.name === collectionName);
        console.log(collectionExists);
        if (!collectionExists) {
            console.log(`Collection ${collectionName} does not exist`);
            return res.status(404).send('Collection not found');
        }
        
        const subjects = await collection.findOne({});
        
        if (subjects) {
            console.log(`Subjects found:`, subjects);
            res.json(subjects);
        } else {
            console.log('No subjects found in the collection');
            res.status(404).send('Subjects not found');
        }
    } catch (error) {
        console.log('Error fetching subjects:', error);
        res.status(500).send('Error fetching subjects');
    }
});

app.get('/api/students/:collectionName', async (req, res) => {
    const collectionName = req.params.collectionName;
    try {
        const collection = mongoose.connection.db.collection(collectionName);
        const students = await collection.find({}).toArray();
        res.json(students);
    } catch (error) {
        console.error(`Error fetching from collection: ${collectionName}`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/saveMarks', async (req, res) => {
    const { collectionName, data } = req.body;

    try {
        const collection = mongoose.connection.collection(collectionName);

        await Promise.all(data.map(async (student) => {
            const query = { enrollment: student.enrollment };
            const update = { $set: student };
            const options = { upsert: true };

            await collection.updateOne(query, update, options);
        }));

        res.status(200).send('Data saved successfully');
    } catch (error) {
        console.error('Error saving marks:', error);
        res.status(500).send('Error saving marks');
    }
});

//******************************************************************************
app.use(express.json({ limit: '100mb' })); // 50MB limit for body-parser JSON
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // 50MB limit for body-parser URL-encoded
 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const name = req.query.name;
        let filename = `${name}${path.extname(file.originalname)}`;

        // Check if file already exists and append a numerical sequence if necessary
        let counter = 1;
        while (fs.existsSync(path.join('uploads', filename))) {
            filename = `${name}_${counter}${path.extname(file.originalname)}`;
            counter++;
        }

        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('file');

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).send('Multer error: ' + err.message);
        } else if (err) {
            return res.status(400).send('File upload failed: ' + err.message);
        }
        res.send('File uploaded successfully');
    });
});

//*****************************************************************************
app.get('/files', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory');
    }
    const fileList = files.map(file => {
      const parts = file.split('_');
      const department = parts[0];
      const semester = parts[1];
      const subject = parts.slice(2).join('_').replace(path.extname(file), '');
      return { name: file, department, semester, subject };
    });
    res.json({ files: fileList });
  });
});

app.get('/download', (req, res) => {
  const fileName = req.query.name;
  const filePath = path.join(__dirname, 'uploads', fileName);
  res.download(filePath, fileName, err => {
    if (err) {
      res.status(500).send('Error downloading file');
    }
  });
});

app.delete('/delete', (req, res) => {
  const fileName = req.query.name;
  const filePath = path.join(__dirname, 'uploads', fileName);
  fs.unlink(filePath, err => {
    if (err) {
      return res.status(500).send('Error deleting file');
    }
    res.send('File deleted successfully');
  });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

//*******************************timetable******************


const timetableSchema = new mongoose.Schema({}, { strict: false });

// Endpoint to fetch timetable based on department and semester
app.post('/api/getTimetable', async (req, res) => {
    const { department, semester } = req.body;
    const collectionName = `${department}_${semester}_timetable`;
	console.log(collectionName);
    try {
        const Timetable = mongoose.model(collectionName, timetableSchema, collectionName);
        const timetable = await Timetable.find({});
        res.json(timetable);
	console.log(timetable);
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch timetable' });
    }
});

//***************************assets management**********
const classroomSchema = new mongoose.Schema({
    classId: { type: String, required: true },
    assets: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true }
        }
    ]
});

const Classroom = mongoose.model('Classroom', classroomSchema);

app.post('/api/assets', async (req, res) => {
    try {
        const { classId, name, quantity } = req.body;
        let classroom = await Classroom.findOne({ classId });
        if (!classroom) {
            classroom = new Classroom({ classId, assets: [] });
        }
        const assetIndex = classroom.assets.findIndex(asset => asset.name === name);
        if (assetIndex > -1) {
            classroom.assets[assetIndex].quantity = quantity;
        } else {
            classroom.assets.push({ name, quantity });
        }
        await classroom.save();
        res.json({ message: 'Asset added/updated successfully', classroom });
    } catch (error) {
        console.error('Error adding/updating asset:', error);
        res.status(500).send('Error adding/updating asset');
    }
});

// Endpoint to get all assets for a class
app.get('/api/assets', async (req, res) => {
    try {
        const { classId } = req.query;
        const classroom = await Classroom.findOne({ classId });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.json(classroom.assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).send('Error fetching assets');
    }
});

// Endpoint to delete an asset
app.delete('/api/assets', async (req, res) => {
    try {
        const { classId, name } = req.body;
        const classroom = await Classroom.findOne({ classId });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        classroom.assets = classroom.assets.filter(asset => asset.name !== name);
        await classroom.save();
        res.json({ message: 'Asset deleted successfully' });
    } catch (error) {
        console.error('Error deleting asset:', error);
        res.status(500).send('Error deleting asset');
    }
});

// Endpoint to clear all assets for a class
app.post('/api/assets/clear', async (req, res) => {
    try {
        const { classId } = req.body;
        const classroom = await Classroom.findOne({ classId });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        classroom.assets = [];
        await classroom.save();
        res.json({ message: 'All assets cleared successfully' });
    } catch (error) {
        console.error('Error clearing assets:', error);
        res.status(500).send('Error clearing assets');
    }
});

//************************announcement**************
const announcementSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    hour: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
app.post('/api/announcement', async (req, res) => {
    try {
        const { date, hour, title, description } = req.body;
        const announcement = new Announcement({ date, hour, title, description, createdAt: new Date() });
        await announcement.save();
        res.json({ message: 'Announcement saved successfully', announcement });
    } catch (error) {
        console.error('Error saving announcement:', error);
        res.status(500).send('Error saving announcement');
    }
});

app.get('/api/announcement', async (req, res) => {
    try {
        const announcements = await Announcement.find();
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).send('Error fetching announcements');
    }
});

app.delete('/api/announcement/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
    if (!deletedAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/announcement/all', async (req, res) => {
  try {
    const allAnnouncements = await Announcement.find();
    res.json(allAnnouncements);
  } catch (err) {
    console.error('Error fetching all announcements:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//******************provide student marks************

app.get('/students_marks/:department/:semester/:year/:enrollment?', async (req, res) => {
    const { department, semester, year, enrollment } = req.params;
    const collectionName = `${department}_${semester}_${year}_marks`;

    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionExists = collections.some(collection => collection.name === collectionName);

        if (!collectionExists) {
            res.json({ message: 'Collection not found' });
            console.log('data is not available');
            return;
        }

        const Student = mongoose.model(collectionName, studentSchema, collectionName);
        const query = enrollment ? { enrollment: parseInt(enrollment) } : {};
        const students = await Student.find(query);

        if (students.length === 0) {
            res.json({ message: 'Collection is available but no data found' });
            console.log('data is not available');
        } else {
            res.json(students);
        }
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).send('Error fetching students');
    }
});
