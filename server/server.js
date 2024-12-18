const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'r.sundaram2015@gmail.com',
    pass: 'ljep zwxo xfrh miaw' 
  }
});

const jsonFilePath = '/home/sundaramramalingam/Angular/elevate/src/assets/json/subscribedMail.json';

app.post('/subscribe', (req, res) => {
  const { email } = req.body;
  
  console.log('Received email:', email);

  const mailOptions = {
    from: 'r.sundaram2015@gmail.com',
    to: email,
    subject: 'Thank you for subscribing!',
    text: 'Thank you for subscribing to our newsletter!'
  };

  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read the file', details: err });
    }

    let jsonContent;
    try {
      jsonContent = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Failed to parse the JSON file', details: parseErr });
    }

    const latestId = jsonContent.length > 0 ? Math.max(...jsonContent.map(entry => entry.id)) : 0;
    const newId = latestId + 1;
    jsonContent.push({ id: newId, email: email });

    fs.writeFile(jsonFilePath, JSON.stringify(jsonContent, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: 'Failed to write the file', details: writeErr });
      }

      transporter.sendMail(mailOptions, (sendMailErr, info) => {
        if (sendMailErr) {
          return res.status(500).json({ error: 'Failed to send email', details: sendMailErr });
        }
        res.status(200).json({ message: 'Email sent successfully', info: info.response });
      });
    });
  });
});




app.post('/addCourse', (req, res) => {
  const newCourse = req.body.course;
  const profession = req.body.profession;
  let filePath = '';

  switch (profession) {
    case 'nurse':
      filePath = '/home/sundaramramalingam/Angular/elevate/src/assets/json/nurse-courses.json';
      break;
    case 'doctor':
      filePath = '/home/sundaramramalingam/Angular/elevate/src/assets/json/doctor-courses.json';
      break;
    case 'nutritionist':
      filePath = '/home/sundaramramalingam/Angular/elevate/src/assets/json/nutritionist-courses.json';
      break;
    case 'pharmacist':
      filePath = '/home/sundaramramalingam/Angular/elevate/src/assets/json/pharmacist-courses.json';
      break;
    default:
      return res.status(400).send('Invalid profession');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) throw err;
    let courses = JSON.parse(data);
    courses.unshift(newCourse);

    fs.writeFile(filePath, JSON.stringify(courses, null, 2), (err) => {
      if (err) throw err;
      res.send('Course added successfully');
    });
  });
});

app.delete('/deleteCourse', (req, res) => {
  const { removeCourses, profession } = req.body;
  let filePath = '';

  switch (profession) {
    case 'nurse':
      filePath = '/home/sundaramramalingam/Angular/elevate/src/assets/json/nurse-courses.json';
      break;
    case 'doctor':
      filePath = '/home/sundaramramalingam/Angular/elevate/src/assets/json/doctor-courses.json';
      break;
    case 'nutritionist':
      filePath = '/home/sundaramramalingam/Angular/elevate/src/assets/json/nutritionist-courses.json';
      break;
    case 'pharmacist':
      filePath = '/home/sundaramramalingam/Angular/elevate/src/assets/json/pharmacist-courses.json';
      break;
    default:
      return res.status(400).send('Invalid profession');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) throw err;
    let courses = JSON.parse(data);
    
    removeCourses.forEach(title => {
      const courseIndex = courses.findIndex(course => course.title === title);
      if (courseIndex !== -1) {
        courses.splice(courseIndex, 1);
      }
    });

    // courses = courses.filter(course => !removeCourses.includes(course.title));

    fs.writeFile(filePath, JSON.stringify(courses, null, 2), (err) => {
      if (err) throw err;
      res.send('Courses deleted successfully');
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
