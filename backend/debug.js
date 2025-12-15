// Debug script to check database state
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Hostel = require('./models/Hostel');
const College = require('./models/College');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostelo_nitt';

async function debug() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Get a sample student
        const student = await Student.findOne({ rollNo: '101001' });
        console.log('\n=== STUDENT DATA ===');
        console.log('Student:', student ? {
            name: student.name,
            rollNo: student.rollNo,
            year: student.year,
            gender: student.gender,
            college: student.college
        } : 'NOT FOUND');

        // Get all hostels
        const hostels = await Hostel.find({});
        console.log('\n=== HOSTELS DATA ===');
        console.log('Total Hostels:', hostels.length);
        hostels.forEach(h => {
            console.log(`- ${h.name}: gender=${h.gender}, allowedYears=${h.allowedYears}, isAvailable=${h.isAvailableForAllocation}, college=${h.college}`);
        });

        // Check filtering logic
        if (student) {
            console.log('\n=== FILTERING DEBUG ===');
            console.log(`Student: year=${student.year}, gender=${student.gender}, college=${student.college}`);

            const filtered = hostels.filter(hostel => {
                const genderMatch = hostel.gender === student.gender;
                const yearMatch = hostel.allowedYears ? hostel.allowedYears.includes(student.year) : true;
                const availableMatch = hostel.isAvailableForAllocation;
                const collegeMatch = String(hostel.college) === String(student.college);

                console.log(`${hostel.name}: genderMatch=${genderMatch}, yearMatch=${yearMatch}, availableMatch=${availableMatch}, collegeMatch=${collegeMatch}`);

                return genderMatch && yearMatch && availableMatch;
            });

            console.log('\n=== FILTERED RESULT ===');
            console.log('Eligible hostels:', filtered.length);
            filtered.forEach(h => console.log(`- ${h.name}`));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

debug();
