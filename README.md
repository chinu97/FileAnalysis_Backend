File Data Analysis and Masking Application
This application allows users to upload multiple large files and perform basic data analysis and masking on them. It provides an elegant user interface for performing the following tasks:

File Upload: Users can upload multiple large files.

Analytics View: For each uploaded file, the application presents an analytics view that includes:
1. File name
2. File size
3. List of unique words in the file along with their counts

Word and Synonym Count: Users can find the count of specific words and their synonyms present in the file using the api-ninjas thesaurus api.

Masking Words: Users can specify a set of words to be masked in the file, and the application streams back the updated file with the specified words masked.

Features
User-friendly interface for easy file upload and analysis.
Real-time analytics for better insights into file contents.
Seamless integration with the api-ninja's thersaurus API for finding synonyms.
Efficient masking functionality to protect sensitive information in files.


Getting Started
Follow these steps to set up the project locally:

Clone the repository to your local machine:

git clone <repository-url>
Navigate to the project directory:

cd FileAnalysis_Backend
Install dependencies:

npm install (use node 14.19.1)
add these variables to the env variables :-
PORT=3000;
S3_BUCKET_NAME=<S3 bucket name>;
S3_PRESIGNED_URL_EXPIRATION_TIME=36000;
S3_REGION=<S3 Region>;
S3_ACCESS_KEY=<S3 Access Key>; // Please contact me for this key
S3_SECRET_ACCESS_KEY=<S3 Secret Access Key> // Please contact me for this key
THESAURUS_API_KEY=<Thesaurus API Key> // Please contact me for this key
I am using s3 to upload the files, Please contact me for S3 access keys and bucket details if required

How to start the server :- node server.js


FLOW DIAGRAM :- 

                  Start
                    |
            Upload Files UI
                    |
          +---------+----------+
          |                    |
     Fetch Pre-signed URL    Upload Files
          |                    |
          |               Upload Complete
          |                    |
    Store File Metadata       |
          |                    |
         End                  |
                               |
          +---------+----------+
          |                    |
    File Analysis UI          |
          |                    |
    Count Unique Words -------|
    and Their Counts          |
          |                    |
    Find Synonyms             |
    for Specific Words -------|
          |                    |
    Mask Specific Words ------|
          |                    |
         End                  |



How to build and deploy the docker files :- 
Build :- docker build -t fileanalysis .
Run :- docker-compose up


Testcases :- https://docs.google.com/document/d/1vVJaBXIHGesxA7CJiZgVcWik8TloyPV3Icw2fHk1tHs/edit

system architecture :- https://photos.app.goo.gl/rE6vXK2fC9td5XcUA


