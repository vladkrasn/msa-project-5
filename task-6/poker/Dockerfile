FROM node:24
COPY . .
run npm install
EXPOSE 8000
CMD ["node", "--import", "./instrumentation.ts", "index.ts"]