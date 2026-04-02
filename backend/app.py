import logging
from flask import Flask
from flask_cors import CORS

from extensions import socketio
from routes.api import api_bp
# We must import the service so that its __init__ background Thread starts running!
from services.traffic_service import traffic_service 

# Disable excessive print output cluttering the terminal.
logging.getLogger('werkzeug').setLevel(logging.ERROR)

def create_app():
    """
    Application Factory Pattern for modular Flask structure.
    """
    app = Flask(__name__)
    
    # Allows cross-origin API calls from UI React (Vite Server 5173 -> Flask 5000)
    CORS(app) 
    
    # Attach our external modular routes namespace (appends /api/ prefix automatically)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Initialize the Websocket extensions onto our application.
    socketio.init_app(app)
    
    return app

if __name__ == "__main__":
    ai_traffic_app = create_app()
    
    # Boot the Websocket Async host in Debug=False. 
    # Threading doesn't play well when debugging is enabled locally.
    print("""
    ========================================================
     🚦 AI Traffic Flow Engine API running precisely on
        => http://localhost:5000
    ========================================================
    """)
    socketio.run(ai_traffic_app, debug=False, host="0.0.0.0", port=5000)
