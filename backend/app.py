from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import openai
from langchain.llms import OpenAI
from langchain.document_loaders import UnstructuredPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.chains.question_answering import load_qa_chain
import pinecone
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_API_ENV = os.getenv('PINECONE_API_ENV')

pinecone.init(
    api_key=PINECONE_API_KEY,
    environment=PINECONE_API_ENV
)

index_name = "langchain2"


def process_document_and_query(file, question, prompt):
    loader = UnstructuredPDFLoader(file)
    data = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=0)
    texts = text_splitter.split_documents(data)
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    docsearch = Pinecone.from_texts(
        [t.page_content for t in texts], embeddings, index_name=index_name)
    docs = docsearch.similarity_search(question, include_metadata=True)
    llm = OpenAI(temperature=0, openai_api_key=OPENAI_API_KEY)
    chain = load_qa_chain(llm, chain_type="stuff")
    answer = chain.run(input_documents=docs, question=prompt)

    return answer


def answer_question_without_file(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=200,
        temperature=0
    )
    answer = response['choices'][0]['message']['content']
    return answer


@app.route('/process-pdf', methods=['POST'])
def process_pdf():
    file = request.files.get('file')
    question = request.form.get('question', '')
    location = request.form.get('location', '')
    prompt = (
        "You are an expert attorney. "
        "Give your advice on the following question: "
    )
    located = " I am located here: "
    located += location
    prompt += question + located
    print(prompt)

    if file and file.filename != '':
        filename = secure_filename(file.filename)
        file.save(os.path.join("/tmp", filename))
        answer = process_document_and_query(
            os.path.join("/tmp", filename), question, prompt)
    else:
        answer = answer_question_without_file(prompt)

    return jsonify({'answer': answer})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

