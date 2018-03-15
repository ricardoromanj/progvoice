from flask import Flask
app = Flask(__name__)

@app.route('/replyhello')
def reply_hello():
    return 'Hello from Python.'

@app.route('/replygoodbye')
def reply_goodbye():
    return 'Good bye from Python.'

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
