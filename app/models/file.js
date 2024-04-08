const mongoose = require('mongoose');
const { Schema } = mongoose;

const fileSchema = new mongoose.Schema({
    code : {
      type : Schema.Types.String,
      required : true
    },
    fileName: {
        type: Schema.Types.String,
        required: true
    },
    contentType: {
        type: Schema.Types.String,
        required: true
    },
    size: {
        type: Schema.Types.Number,
        required: true
    },
    uploadDate: {
        type: Schema.Types.Date,
        default: Date.now
    }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
