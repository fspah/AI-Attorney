# pdf-document-processor

PDF document processor with OpenAI

Insert a link of a PDF document and ask a question about anything inside it. Then wait for AI to search the document and generate a response.

Getting Started


These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
Prerequisites

You need to have npm (for the React app) and python along with pip (for the Flask server) installed on your system.

    For npm, you can download Node.js (which includes npm) from here.
    For Python and pip, you can download Python from here and pip usually comes installed with Python. If not, follow this guide.

Installing

Clone the repository to your local machine.

bash

git clone https://github.com/fspah/pdf-document-processor.git


bash

cd pdf-document-processor

Setting up the Flask Server

bash

pip install -r requirements.txt

Start the server.

python server.py

Setting up the React App

bash

cd my-App

npm install

npm start

The application should now be running on localhost:3001, and the server on localhost:5001.
    
