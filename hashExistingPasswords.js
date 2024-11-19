const mongoose = require('mongoose');
const Users = require('./models').User; 
const bcrypt = require('bcrypt');

(async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/myNewDatabase');
        console.log('Connected to MongoDB.');

        const username = 'emily_watson';
        const newPassword = 'emily_w987'; 

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const updatedUser = await Users.findOneAndUpdate(
            { Username: username },
            { Password: hashedPassword },
            { new: true }
        );

        console.log(`Password for ${updatedUser.Username} updated successfully.`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
})();