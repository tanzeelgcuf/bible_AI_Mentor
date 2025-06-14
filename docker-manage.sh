#!/bin/bash
case "$1" in
    start|"")
        echo "🚀 Starting One Million Preachers..."
        docker-compose up --build -d
        echo "✅ Started! Visit http://localhost:3000"
        ;;
    stop)
        docker-compose down
        ;;
    logs)
        docker-compose logs -f $2
        ;;
    status)
        docker-compose ps
        ;;
    *)
        echo "Usage: $0 [start|stop|logs|status]"
        ;;
esac
