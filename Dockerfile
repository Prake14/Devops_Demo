# Use lightweight Nginx image
FROM nginx:alpine

# Remove default Nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy your static files
COPY index.html /usr/share/nginx/html/

# Expose port 80 (Nginx default)
EXPOSE 80