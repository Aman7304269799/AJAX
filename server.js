const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const existingUsernames = ['john123', 'alice', 'bob99', 'mike2024', 'susanx', 'emily', 'testuser', 'guest1', 'jackie', 'user007'];
const collegeNames = [
  "Harvard University", "Stanford University", "MIT", "UC Berkeley", "Oxford University",
  "Cambridge University", "Carnegie Mellon", "Yale University", "Princeton University", "Columbia University"
];

function sendJSON(res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Serve static HTML file
  if (req.method === 'GET' && (pathname === '/' || pathname === '/client.html')) {
    const filePath = path.join('public', 'client.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading page.");
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }

  // Check if username exists
  else if (req.method === 'POST' && pathname === '/check-username') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { username } = JSON.parse(body);
      const exists = existingUsernames.includes(username.toLowerCase());
      sendJSON(res, { exists });
    });
  }

  // Suggest college names
  else if (req.method === 'GET' && pathname === '/suggest-college') {
    const query = parsedUrl.query.query.toLowerCase();
    const matches = collegeNames.filter(name => name.toLowerCase().includes(query));
    sendJSON(res, matches.slice(0, 5)); // Limit to 5 suggestions
  }

  // Register new user
  else if (req.method === 'POST' && pathname === '/register') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { name, college, username, password } = JSON.parse(body);
      if (!existingUsernames.includes(username.toLowerCase())) {
        existingUsernames.push(username.toLowerCase()); // Simulate storing
        sendJSON(res, { message: "Successfully Registered" });
      } else {
        sendJSON(res, { message: "Username already exists" });
      }
    });
  }

  else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
