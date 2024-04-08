const mongoose = require('mongoose');
const { Schema } = mongoose;

const uniqueWordsSchema = new mongoose.Schema({
    code : {
        type : Schema.Types.String,
        required : true
    },
    fileName: {
        type: Schema.Types.String,
        required: true
    },
    uniqueWords : {
        type : Schema.Types.Mixed
    }
});

const UniqueWords = mongoose.model('UniqueWords', uniqueWordsSchema);

module.exports = UniqueWords;
