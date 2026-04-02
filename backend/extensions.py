from flask_socketio import SocketIO

# Instantiate the SocketIO object here to avoid circular imports.
socketio = SocketIO(cors_allowed_origins="*")
